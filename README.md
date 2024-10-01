# Currency Conversion with Monte Carlo Simulation Using Signaloid API

This project is a command-line application that converts currency from GBP to EUR (and vice versa) using the Signaloid Cloud Compute Engine API. It incorporates uncertainty in the conversion rate using Monte Carlo simulations to calculate a distribution of possible outcomes. The Signaloid API is leveraged to handle the uncertainty computation.

## Features

- Converts a specified amount from GBP to EUR or EUR to GBP.
- Allows uncertainty in the conversion rate.
- Uses **Monte Carlo simulations** to model the uncertainty in the conversion rates.
- Performs simulations on the **Signaloid Cloud Compute Engine**, using their uncertainty API.
- Fetches and displays the results, including statistical data about the distribution of converted values.

## Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js**
- **npm** (comes with Node.js)
- **nvm** (optional, but recommended to manage Node.js versions)
- **Signaloid API key** (required for authentication)

## Setting Up the Project

### 1. Clone the Repository

```bash
git clone https://github.com/dimitrisniras/currency-converter.git
cd currency-converter
```

### 2. Node.js Version

Ensure you’re using the correct Node.js version. You can switch to the correct version using nvm:

```bash
nvm use
```

This will load the version specified in the .nvmrc file.

If you don’t have nvm installed, follow the instructions here to install it: [nvm installation guide](https://github.com/nvm-sh/nvm)

### 3. Install Dependencies

Run the following command to install the required Node.js packages:

```bash
npm install
```

### 4. Configure Environment Variables

Create a .env file in the root of your project directory:

```bash
touch .env
```

Add the following content to the .env file:

```env
SIGNALOID_API_KEY=your-signaloid-api-key-here
SIGNALOID_API_URL=https://api.signaloid.io/tasks
```

Replace `your-signaloid-api-key-here` with your actual API key obtained from the Signaloid API platform.

### 5. Running the Application

Run the following command to start the application:

```bash
npm start
```

The application will prompt you to input:

- Value to be converted: Enter a value (e.g., 100).
- Source Currency: Enter a value (e.g., GBP).
- Target Currency: Enter a value (e.g., EUR).
- Minimum Conversion Rate: Enter a value (e.g., 1.15).
- Maximum Conversion Rate: Enter a value (e.g., 1.20).
