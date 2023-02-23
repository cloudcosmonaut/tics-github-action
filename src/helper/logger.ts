import * as core from '@actions/core';
import { ticsConfig } from '../configuration';

export default class Logger {
  private static _instance: Logger;
  called: string = '';
  matched: string[] = [];

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  /**
   * Uses core.info to print to the console with a purple color.
   * @param string
   */
  header(string: string): void {
    string = this.maskSecrets(string);
    this.addNewline('header');
    core.info(`\u001b[34m${string}`);
    this.called = 'header';
  }

  /**
   * Uses core.info to print to the console.
   *
   * @param string
   */
  info(string: string): void {
    string = this.maskSecrets(string);
    core.info(string);
    this.called = 'info';
  }

  /**
   * Uses core.debug to print to the console.
   *
   * @param string
   */
  debug(string: string): void {
    string = this.maskSecrets(string);
    core.debug(string);
    this.called = 'debug';
  }

  /**
   * Uses core.warning to print to the console.
   *
   * @param string
   */
  warning(string: string): void {
    string = this.maskSecrets(string);
    core.warning(`\u001b[33m${string}`);
    this.called = 'warning';
  }

  /**
   * Uses core.error to print to the console with a red color.
   *
   * @param error
   */
  error(error: string): void {
    error = this.maskSecrets(error);
    this.addNewline('error');
    core.error(`\u001b[31m${error}`);
    this.called = 'error';
  }

  /**
   * Uses core.setFailed to exit with error.
   *
   * @param error
   */
  setFailed(error: string): void {
    error = this.maskSecrets(error);
    this.addNewline('error');
    core.setFailed(`\u001b[31m${error}`);
    this.called = 'error';
  }

  /**
   * Uses core.setFailed to exit with error.
   *
   * @param error
   */
  exit(error: string): void {
    error = this.maskSecrets(error);
    this.addNewline('error');
    core.setFailed(`\u001b[31m${error}`);
    process.exit(1);
  }

  /**
   * Add newline above header, error and setFailed if the logger has been called before.
   * @param type the type of call to add a newline for.
   */
  addNewline(type: string): void {
    if (this.called) {
      if (type === 'header') {
        core.info('');
      }
    }
  }

  /**
   * Masks the secrets defined in ticsConfig secretsFilter from the console logging.
   * @param string string that is going to be logged to the console.
   * @returns the message with the secrets masked.
   */
  public maskSecrets(string: string): string {
    let filtered = string;
    ticsConfig.secretsFilter.forEach(secret => {
      if (filtered.match(new RegExp(secret, 'gi'))) {
        const regex = new RegExp(`\\w*${secret}\\w*(?:[ \\t]*[:=>]*[ \\t]*)(.*)`, 'gi');
        let match: RegExpExecArray | null = null;
        while ((match = regex.exec(filtered))) {
          this.matched.push(match[1]);
          if (match && match[1] !== '') filtered = filtered.replaceAll(match[1], '***');
        }
      }
    });
    this.matched.forEach(match => {
      filtered = filtered.replaceAll(match, '***');
    });
    return filtered;
  }
}
