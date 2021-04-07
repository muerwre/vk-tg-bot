import yargs from 'yargs'

const { hideBin } = require('yargs/helpers')

export type CmdArgument = 'config';

export const getCmdArg = (name: CmdArgument) => (
  yargs(hideBin(process.argv)).argv[name] as string | undefined
)
