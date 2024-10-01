require("dotenv").config();

const axios = require("axios");
const readline = require("readline");

const API_KEY = process.env.SIGNALOID_API_KEY;
const API_URL = process.env.SIGNALOID_API_URL;
const ALLOWED_CURRENCIES = ["GBP", "EUR"];

// Set up the command-line interface to read user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to create a task for currency conversion using the Signaloid API
async function convertCurrency(minRate, maxRate, value) {
  console.debug("Preparing task request for Signaloid API...");

  const taskRequestBody = {
    Type: "SourceCode", // Task type: This task will execute the provided C source code
    SourceCode: {
      Object: "SourceCode", // Defining this as a SourceCode task
      // The C code performs the currency conversion, simulating uncertainty by generating random conversion rates
      Code: `
        #include <stdio.h>
        #include <stdlib.h>
        #include <uxhw.h>

        int main() {
          float conversionRate = UxHwFloatUniformDist(${minRate}, ${maxRate});
          float convertedValue = ${value} * conversionRate;
          printf("%f\\n", convertedValue);
          return 0;
        }
      `,
      Language: "C", // Specifies the programming language of the provided code
    },
    Overrides: {
      // Add any additional arguments or parameters for the task
      Arguments: `minRate=${minRate} maxRate=${maxRate} value=${value}`,
    },
  };

  try {
    console.debug("Sending request to Signaloid API...");

    const response = await axios.post(API_URL, taskRequestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: API_KEY,
      },
    });

    const taskId = response.data.TaskID;
    console.info(`Task created successfully. Task ID: ${taskId}`);

    await fetchTaskResults(taskId);
  } catch (error) {
    console.error(`Error creating task: ${error.response?.data || error.message}`);
  }
}

// Function to fetch the task results from the Signaloid API
// Once the task is processed, we can retrieve the outputs (e.g., converted value)
async function fetchTaskResults(taskId) {
  try {
    console.debug(`Fetching results for Task ID: ${taskId}...`);

    const response = await axios.get(`${API_URL}/${taskId}/outputs`, {
      headers: {
        Authorization: API_KEY,
      },
    });

    console.debug("Task results retrieved successfully.");

    if (response.data?.Stderr) {
      const stderrContent = await fetchFileContentWithRetry(response.data.Stderr);
      if (stderrContent) {
        console.info(`Task Error ${stderrContent}`);
        return;
      }
    }

    // Fetch the content of stdout and stderr
    if (response.data?.Stdout) {
      const stdoutContent = await fetchFileContentWithRetry(response.data.Stdout);

      if (stdoutContent) {
        stdoutContentSplited = stdoutContent.split(".");
        if (stdoutContentSplited.length > 1) stdoutContentSplited[1] = stdoutContentSplited[1].slice(0, 2);
        console.info(`\n\nCONVERTED VALUE: ${stdoutContentSplited.join(".")}\n\n`);
      }
    }
  } catch (error) {
    console.error(`Error fetching task results: ${error.response?.data || error.message}`);
  }
}

// Helper function to fetch content from a file URL (e.g., S3 file)
async function fetchFileContentWithRetry(fileUrl, retries = 3, backoff = 500) {
  try {
    const response = await axios.get(fileUrl);
    return response.data;
  } catch (error) {
    // If we hit a server-side error we retry
    if (retries > 0 && error.response?.status >= 500) {
      console.error(`Error fetching file content. Retrying in ${backoff}ms... (Retries left: ${retries})`);

      // Wait for the backoff period before retrying
      await new Promise((resolve) => setTimeout(resolve, backoff));

      // Retry with exponential backoff (backoff increases with each attempt)
      return fetchFileContentWithRetry(fileUrl, retries - 1, backoff * 2);
    } else {
      console.error(`Error fetching file content: ${error.message}`);
      return null;
    }
  }
}

// Function to ask if the user wants to run another conversion
function askToRepeat() {
  rl.question('Do you want to perform another conversion? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
      main();
    } else {
      console.info('Exiting program...');
      rl.close();
    }
  });
}

// Main function to handle user input
// This function interacts with the user to get the necessary input (currencies and rates)
function main() {
  // Ask the user for the value to be converted
  rl.question("Enter value to be converted: ", (value) => {
    // Ask the user for the source currency (e.g., GBP)
    rl.question("Enter source currency (e.g., GBP): ", (sourceCurrency) => {
      sourceCurrency = sourceCurrency.toUpperCase();
      // Ask the user for the target currency (e.g., EUR)
      rl.question("Enter target currency (e.g., EUR): ", (targetCurrency) => {
        targetCurrency = targetCurrency.toUpperCase();
        // Ask the user for the minimum conversion rate
        rl.question("Enter the minimum conversion rate: ", (minRate) => {
          // Ask the user for the maximum conversion rate
          rl.question("Enter the maximum conversion rate: ", (maxRate) => {
            console.debug("Validating input...");

            // Validate taget and source currencies input
            if (!ALLOWED_CURRENCIES.includes(sourceCurrency) || !ALLOWED_CURRENCIES.includes(targetCurrency)) {
              console.error(`Error: Source and Target currencies must be one of ${ALLOWED_CURRENCIES}`);
              return askToRepeat();
            }

            // Perform the currency conversion with the provided input
            convertCurrency(parseFloat(minRate), parseFloat(maxRate), parseFloat(value))
              .then(() => askToRepeat());
          });
        });
      });
    });
  });
}

main();
