import workerize from 'workerize'

// eslint-disable-next-line import/no-webpack-loader-syntax
import fileReaderSource from 'raw-loader!./fileReader'
import * as FileReaderType from './fileReader'

export const fileReader = workerize<typeof FileReaderType>(fileReaderSource)
