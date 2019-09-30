import _ from 'lodash'
import { List, Map, OrderedMap } from 'immutable'
import { Observable, Subscriber } from 'rxjs'
import uuid from 'uuid/v4'

import {
  DEFAULT_CONCURRENT_DOWNLOADS_LIMIT,
  DEFAULT_CONCURRENT_FILE_READS_LIMIT,
  DEFAULT_CONCURRENT_RAF_LIMIT,
  DEFAULT_CONCURRENT_RECORD_OPERATIONS_LIMIT,
  DEFAULT_CONCURRENT_UPLOADS_LIMIT,
  DISPATCHER_THROTTLE_INTERVAL,
} from 'constants/index'

export enum Queue {
  Download = 'Download',
  RAF = 'RAF',
  ReadFile = 'ReadFile',
  RecordOperation = 'RecordOperation',
  Upload = 'Upload',
}

export type QueueKeys = keyof typeof Queue

type JobAction<T> = (
  resolve: (result: T) => void,
  reject: (error: Error) => void,
) => void

export interface Job<T extends any = any> {
  action: JobAction<T>
  id: string
  queue: Queue
  subscriber: Subscriber<T>
}

let sharedDispatcher: Dispatcher | undefined = undefined

export default class Dispatcher {
  static sharedInstance = () => {
    if (sharedDispatcher === undefined) {
      sharedDispatcher = new Dispatcher()
    }

    return sharedDispatcher
  }

  private isRunning = true
  private jobs = OrderedMap<string, Job>()
  private limits = Map<QueueKeys, number>([
    [Queue.Download, DEFAULT_CONCURRENT_DOWNLOADS_LIMIT],
    [Queue.RAF, DEFAULT_CONCURRENT_RAF_LIMIT],
    [Queue.ReadFile, DEFAULT_CONCURRENT_FILE_READS_LIMIT],
    [Queue.RecordOperation, DEFAULT_CONCURRENT_RECORD_OPERATIONS_LIMIT],
    [Queue.Upload, DEFAULT_CONCURRENT_UPLOADS_LIMIT],
  ])
  private queues = Map<QueueKeys, List<string>>([
    [Queue.Download, List<string>()],
    [Queue.RAF, List<string>()],
    [Queue.ReadFile, List<string>()],
    [Queue.RecordOperation, List<string>()],
    [Queue.Upload, List<string>()],
  ])
  private activeCounts = Map<QueueKeys, number>([
    [Queue.Download, 0],
    [Queue.RAF, 0],
    [Queue.ReadFile, 0],
    [Queue.RecordOperation, 0],
    [Queue.Upload, 0],
  ])

  private dequeueJobsFromQueueWithKey = (queueKey: QueueKeys) => {
    const queue = this.queues.get(queueKey)
    const limit = this.limits.get(queueKey) || 1
    const activeCount = this.activeCounts.get(queueKey) || 0
    const dequeueCount = limit - activeCount

    if (queue !== undefined && queue.size > 0 && dequeueCount > 0) {
      const dequeuedJobs = queue
        .slice(0, dequeueCount)
        .map(id => this.jobs.get(id))
        .filter(j => j !== undefined) as List<Job>
      this.queues = this.queues.set(queueKey, queue.slice(dequeueCount))
      return dequeuedJobs
    }

    return List<Job>()
  }

  private jobDidFinish = (job: Job) => {
    const activeCount = this.activeCounts.get(job.queue) || 0
    this.activeCounts = this.activeCounts.set(job.queue, activeCount - 1)
    this.jobs = this.jobs.delete(job.id)
    this.dequeueJobs()
  }

  private jobDidSucceed = (job: Job, result: any) => {
    job.subscriber.next(result)
    job.subscriber.complete()
    this.jobDidFinish(job)
  }

  private jobDidFail = (job: Job, error: any) => {
    job.subscriber.error(error)
    this.jobDidFinish(job)
  }

  private performJobNow = (job: Job) => {
    job.action(
      result => this.jobDidSucceed(job, result),
      error => this.jobDidFail(job, error),
    )
  }

  private dequeueJobs = _.throttle(() => {
    if (!this.isRunning) {
      return
    }

    _.each(
      [Queue.Download, Queue.ReadFile, Queue.RecordOperation, Queue.Upload],
      queueKey => {
        this.dequeueJobsFromQueueWithKey(queueKey).forEach(this.performJobNow)
      },
    )

    this.dequeueJobsFromQueueWithKey(Queue.RAF).forEach(job =>
      requestAnimationFrame(() => this.performJobNow(job)),
    )
  }, DISPATCHER_THROTTLE_INTERVAL)

  start = () => (this.isRunning = true)
  stop = () => (this.isRunning = false)

  performAsync = <T>(queue: Queue, action: JobAction<T>) => {
    return new Observable<T>(subscriber => {
      const id = uuid()
      this.jobs = this.jobs.set(id, { action, id, queue, subscriber })
      const currentQueue = this.queues.get(queue) || List<string>()
      this.queues = this.queues.set(queue, currentQueue.push(id))
      this.dequeueJobs()
    })
  }

  cancelJob = (id: string) => {}
}
