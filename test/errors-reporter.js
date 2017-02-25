/**
 * Reports only errors to console
 */

module.exports = class ErrorsReporter {
  handleEvent(event, data) {
    const error = data && data.error;
    if (error) {
      console.error(event, error);
    }
  }
};
