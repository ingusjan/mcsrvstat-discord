import chalk from "chalk";
import dayjs from "dayjs";

const FORMAT = "YYYY-MM-DD HH:mm:ss";

/**
 * Logger utility with colored output and timestamps
 */
export const logger = {
  /**
   * Log information message with blue color and timestamp
   */
  info: (message: string): void => {
    const timestamp = dayjs().format(FORMAT);
    console.log(
      `${chalk.gray(`[${timestamp}]`)} ${chalk.blue("INFO")} ${message}`
    );
  },

  /**
   * Log success message with green color and timestamp
   */
  success: (message: string): void => {
    const timestamp = dayjs().format(FORMAT);
    console.log(
      `${chalk.gray(`[${timestamp}]`)} ${chalk.green("SUCCESS")} ${message}`
    );
  },

  /**
   * Log warning message with yellow color and timestamp
   */
  warn: (message: string): void => {
    const timestamp = dayjs().format(FORMAT);
    console.log(
      `${chalk.gray(`[${timestamp}]`)} ${chalk.yellow("WARNING")} ${message}`
    );
  },

  /**
   * Log error message with red color and timestamp
   */
  error: (message: string, error?: unknown): void => {
    const timestamp = dayjs().format(FORMAT);
    console.error(
      `${chalk.gray(`[${timestamp}]`)} ${chalk.red("ERROR")} ${message}`
    );
    if (error) {
      console.error(error);
    }
  },
};
