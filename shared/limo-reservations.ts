import { FunctionDefinition } from '@azure/openai';

export const INITIAL_BANK_ACCOUNT_BALANCE: number = 200.0;
export let CURRENT_BANK_ACCOUNT_BALANCE: number = INITIAL_BANK_ACCOUNT_BALANCE;

export interface MoneyDetails {
  accountBalance: number;
  totalCostOfReservation: number;
}

export interface LimoReservation {
  reservationDate: string;
  numberOfPassengers: number;
}

export interface AvailabilitySearch {
  searchDate: string;
}

/**
 * Returns if the Account Balance is sufficient to make the reservation
 * @param request
 * @return boolean
 */
export function compareBankAccountToReservationTotal(request: MoneyDetails) {
  return request.accountBalance >= request.totalCostOfReservation;
}
/**
 * Returns the Current Bank Account Balance for the customer
 *
 * @return the current bank-account balance in USD
 */
export function getBankAccountBalance() {
  return CURRENT_BANK_ACCOUNT_BALANCE;
}

/**
 * Deducts the specified amount from the customer's bank account
 *
 * @param withdrawalAmount - the amount to withdraw from the account
 * @return the current bank-account balance in USD
 */
export function withDrawFunds(withdrawalAmount: number) {
  CURRENT_BANK_ACCOUNT_BALANCE = CURRENT_BANK_ACCOUNT_BALANCE - withdrawalAmount;
  return CURRENT_BANK_ACCOUNT_BALANCE;
}

/**
 * Deposits the specified amount into the customer's bank account
 *
 * @param depositAmount - the amount to deposit into the account
 * @return the current bank-account balance in USD
 */
export function depositFunds(depositAmount: number) {
  CURRENT_BANK_ACCOUNT_BALANCE = CURRENT_BANK_ACCOUNT_BALANCE + depositAmount;

  return CURRENT_BANK_ACCOUNT_BALANCE;
}

/**
 * Returns Limousine Capacity for the Current Date
 *
 * @param search
 * @return Returns 30 for even numbered days and 11 for odd numbered days
 */
export function getLimousineCapacity(search: AvailabilitySearch) {
  const date = search.searchDate;
  const dateParts: string[] = date.split('-');
  const dayOfMonth: number = +dateParts[2];

  // limousine capacity calculation
  let limousineCapacity: number = 30;
  if (dayOfMonth % 2 == 1) {
    limousineCapacity = 11;
  }

  return limousineCapacity;
}

/**
 * Calculates the Grand Total for the Limousine Reservation
 *
 * The cost is $50.00 per passenger
 *
 * A 10-percent discount is applied on odd-numbered days
 *
 * Customers get an additional 20-percent discount for reservations with 10 or more passengers
 *
 * @param request - the number of passengers and date of reservation
 * @return the grand total in US dollars
 */
export function calculateReservationTotal(request: LimoReservation) {
  const totalPassengers: number = request.numberOfPassengers;
  const reservationDate: string = request.reservationDate;
  const dateParts: string[] = reservationDate.split('-');
  const dayOfMonth: number = +dateParts[2];

  const pricePerPassenger = 50.0;

  let discount = 0.0;

  // Give 10% off if the day of the month is odd
  if (dayOfMonth % 2 == 1) {
    discount = 0.1;
  }

  // Give an additional 20% off for reservations with 10 or more passengers
  if (totalPassengers >= 10) {
    discount = 0.2 + discount;
  }

  const subTotal: number = pricePerPassenger * totalPassengers;

  const finalTotal: number = subTotal * (1 - discount);

  return finalTotal;
}

export function getAvailableDates() {
  const availableDates: string[] = ['2023-12-01', '2023-12-02', '2023-12-03', '2023-12-04', '2023-12-15', '2023-12-16', '2023-12-17', '2023-12-22'];
  return availableDates;
}

export function isAvailableDate(search: AvailabilitySearch) {
  const dates = getAvailableDates();
  return dates.includes(search.searchDate);
}

export function getExistingReservations() {
  const reservations: LimoReservation[] = [
    {
      reservationDate: '2023-12-02',
      numberOfPassengers: 4,
    },
    {
      reservationDate: '2023-12-07',
      numberOfPassengers: 8,
    },
    {
      reservationDate: '2023-12-19',
      numberOfPassengers: 7,
    },
  ];

  return reservations;
}

export function makeReservation(request: LimoReservation) {
  const reservationDate = request.reservationDate;
  const passengerCount = request.numberOfPassengers;
  const reservation: LimoReservation = { reservationDate: reservationDate, numberOfPassengers: passengerCount };

  // Calculates the total cost of the reservation in US dollars
  const totalReservationCost = calculateReservationTotal(reservation);

  // Deducts this amount from the customer's bank account
  withDrawFunds(totalReservationCost);

  return reservation;
}

export function cancelReservation(request: AvailabilitySearch) {
  const reservationDate = request.searchDate;
  const passengerCount = 0;
  let reservation: LimoReservation;
  reservation = { reservationDate: reservationDate, numberOfPassengers: passengerCount };

  // We always return 0.00 to the customer's account each time a reservation is cancelled.
  depositFunds(0.0);

  return reservation;
}

export function getFunctionDefinitions() {
  const functionDefinitions: FunctionDefinition[] = [
    {
      name: 'getBankAccountBalance',
      description: 'Returns the current available bank account balance of the customer in US dollars.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'getAvailableDates',
      description: 'Returns the list of available dates for limousine reservations.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'getExistingReservations',
      description: 'Returns the list of reservations the customer has already made.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'compareBankAccountToReservationTotal',
      description: "Returns a boolean indicating if the customer's account is greater than or equal to the total cost of the reservation",
      parameters: {
        type: 'object',
        properties: {
          accountBalance: {
            type: 'number',
            description: "The available balance on the customer's bank account",
          },
          totalCostOfReservation: {
            type: 'number',
            description: 'The total cost of the limousine reservation',
          },
        },
        required: ['searchDate'],
      },
    },
    {
      name: 'isAvailableDate',
      description: 'Returns a boolean indicating if the specified reservationDate is available for a reservation.',
      parameters: {
        type: 'object',
        properties: {
          searchDate: {
            type: 'string',
            description: 'The reservationDate the customer is interested in making a reservation. Ask the user if not obtained. Dont assume',
          },
        },
        required: ['searchDate'],
      },
    },
    {
      name: 'getLimousineCapacity',
      description: 'Returns an integer indicating the maximum number of passengers for the limousine reservation for a specific date',
      parameters: {
        type: 'object',
        properties: {
          searchDate: {
            type: 'string',
            description: 'The reservationDate the customer is interested in making a limousine reservation. Ask the user if not obtained. Dont assume',
          },
        },
        required: ['searchDate'],
      },
    },
    {
      name: 'cancelReservation',
      description: 'Cancels a pre-existing reservation for the specified reservation date',
      parameters: {
        type: 'object',
        properties: {
          searchDate: {
            type: 'string',
            description: 'The reservationDate the customer is interested in cancelling an existing reservation. Do not assume, ask the customer for which date they would like to cancel',
          },
        },
        required: ['searchDate'],
      },
    },
    {
      name: 'calculateReservationTotal',
      description: 'Calculates the total cost of the limousine reservation in US dollars for the specified date and number of passengers',
      parameters: {
        type: 'object',
        properties: {
          reservationDate: {
            type: 'string',
            description: 'The date of reservation in YYYY-MM-DD format. Ask the user if not obtained. Dont assume',
          },
          numberOfPassengers: {
            type: 'number',
            description: 'The total number of passengers for the reservation. Ask the user if not obtained. Dont assume',
          },
        },
        required: ['reservationDate', 'numberOfPassengers'],
      },
    },
    {
      name: 'makeReservation',
      description: 'Creates or makes a new reservation for the specified date and number of passengers',
      parameters: {
        type: 'object',
        properties: {
          reservationDate: {
            type: 'string',
            description: 'The date of reservation in YYYY-MM-DD format. Ask the user if not obtained. Dont assume',
          },
          numberOfPassengers: {
            type: 'number',
            description: 'The total number of passengers for the reservation. Ask the user if not obtained. Dont assume',
          },
        },
        required: ['reservationDate', 'numberOfPassengers'],
      },
    },
  ];
  return functionDefinitions;
}

export function getFunctionMap() {
  const funcMap = {
    getBankAccountBalance: getBankAccountBalance,
    getAvailableDates: getAvailableDates,
    makeReservation: makeReservation,
    getExistingReservations: getExistingReservations,
    isAvailableDate: isAvailableDate,
    cancelReservation: cancelReservation,
    getLimousineCapacity: getLimousineCapacity,
    calculateReservationTotal: calculateReservationTotal,
    compareBankAccountToReservationTotal: compareBankAccountToReservationTotal,
  };

  return funcMap;
}
