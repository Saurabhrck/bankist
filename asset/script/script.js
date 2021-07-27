'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale
const currency = '₹';
const options = {
  day: 'numeric',
  month: 'long',
  year: '2-digit',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
};
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2021-07-22T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Saurabh Ghosh',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2021-07-25T12:01:20.894Z',
  ],
  currency: 'INR',
  locale: 'en-IN',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const computeUserName = function (fullName) {
  return fullName
    .toLowerCase()
    .split(' ')
    .map(word => word[0])
    .join('');
};
accounts.forEach(account => {
  account.username = computeUserName(account.owner);
});

const elapsedDays = function (date, locale) {
  const days = Math.round(
    (new Date() - new Date(date)) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days <= 7) {
    return `${days} days ago`;
  } else {
    return new Date(date).toLocaleDateString(locale);
  }
};

const calcDisplayBalance = function (account) {
  account.balance = account.movements.reduce((acc, move) => acc + move, 0);
  labelBalance.textContent = `${account.balance.toFixed(2)}${currency}`;
};

const displayMovement = function (movements, movementsDates, locale) {
  containerMovements.innerHTML = '';
  movements.forEach((movement, index) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type}</div>
    <div class="movements__date">${elapsedDays(
      movementsDates[index],
      locale
    )}</div>
      <div class="movements__value">${movement.toFixed(2)}${currency}</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// displayMovement(account1.movements);

const calcSummary = function (movements, interest) {
  const income = movements
    .filter(move => move > 0)
    .reduce((acc, move) => acc + move, 0);

  const withdrawal = movements
    .filter(move => move < 0)
    .reduce((acc, move) => acc + move, 0);

  const interestValue = movements
    .filter(move => move > 0)
    .map(move => (move * interest) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  return [income, withdrawal, interestValue];
};

const displaySummary = function (income, withdrawal, interest) {
  labelSumIn.textContent = `${income.toFixed(2)}${currency}`;
  labelSumOut.textContent = `${Math.abs(withdrawal).toFixed(2)}${currency}`;
  labelSumInterest.textContent = `${interest.toFixed(2)}${currency}`;
};

function login(username, password) {
  return accounts.find(acc => {
    return acc.username === username && acc.pin === password;
  });
}

// console.log(login("jd", 2222));
const displayMovementSorted = function (acc) {
  if (!btnSort.value) {
    displayMovement(acc.movements, acc.movementsDates, acc.locale);
  } else if (btnSort.value === 'ascending') {
    sortMovementsAscending();
  } else {
    sortMovementsDescending();
  }
};

const updateUI = function (acc) {
  displayMovementSorted(acc);
  calcDisplayBalance(acc);
  displaySummary(...calcSummary(acc.movements, acc.interestRate));
  labelDate.textContent = new Intl.DateTimeFormat(acc.locale, options).format(
    new Date()
  );
  window.dateTimer = setInterval(() => {
    labelDate.textContent = new Intl.DateTimeFormat(
      window.currentAccount.locale,
      options
    ).format(new Date());
  }, 1000);
};

const loginInit = function () {
  const acc = login(inputLoginUsername.value, Number(inputLoginPin.value));
  if (acc) {
    labelWelcome.textContent = `Welcome Back, ${acc.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;
    btnSort.value = inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    window.currentAccount = acc;
    updateUI(acc);
    if (window.logoutTimer) {
      clearInterval(window.logoutTimer);
      delete window.logoutTimer;
    }
    window.logoutTimer = setLogoutTimer(100);
  } else {
    labelWelcome.textContent = 'Invalid login ❌❌❌';
  }
};

const fundTransfer = function (username, fund) {
  if (
    fund &&
    fund > 0 &&
    window.currentAccount.username !== username &&
    window.currentAccount.balance >= fund
  ) {
    const account = accounts.find(acc => acc.username === username);
    if (account) {
      window.currentAccount.movements.push(-fund);
      window.currentAccount.movementsDates.push(new Date().toISOString());
      account.movements.push(fund);
      account.movementsDates.push(new Date().toISOString());
      updateUI(window.currentAccount);
    } else {
      alert('No account found');
    }
  } else if (window.currentAccount.username === username) {
    alert('Recipient should be different');
  } else if (!fund || fund <= 0) {
    alert('Amount is invalid');
  } else {
    alert('Not enough balance to make transfer');
  }
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();
};

const issueLoan = function (amount) {
  const value = Math.floor(amount);
  if (value > 0) {
    const eligible = window.currentAccount.movements
      .filter(move => move > 0)
      .some(move => move >= value * 0.1);
    if (eligible) {
      setTimeout(function () {
        window.currentAccount.movements.push(value);
        window.currentAccount.movementsDates.push(new Date().toISOString());
        updateUI(window.currentAccount);
      }, 3000);
    } else {
      alert('Amount is not eligible');
    }
  } else {
    alert('Invalid amount');
  }
};

const logoutUser = function () {
  labelWelcome.textContent = `Log in to get started`;
  containerApp.style.opacity = 0;
  if (window.dateTimer) {
    clearInterval(window.dateTimer);
    delete window.dateTimer;
  }
  if (window.logoutTimer) {
    clearInterval(window.logoutTimer);
    delete window.logoutTimer;
  }
  delete window.currentAccount;
};

const closeAccount = function (username, pin) {
  if (
    window.currentAccount.username === username &&
    window.currentAccount.pin === pin
  ) {
    const index = accounts.findIndex(acc => {
      return acc.username === username && acc.pin === pin;
    });
    accounts.splice(index, 1);
    logoutUser();
  } else {
    alert('Only allowed to close own account');
  }
  inputCloseUsername.value = inputClosePin.value = '';
  inputClosePin.blur();
};

function createMoveDate() {
  return Array.from(
    {
      length: window.currentAccount.movements.length,
    },
    (_, index) => {
      return {
        value: window.currentAccount.movements[index],
        date: window.currentAccount.movementsDates[index],
      };
    }
  );
}

const sortMovementsAscending = function () {
  const moveDate = createMoveDate();
  moveDate.sort((a, b) => a.value - b.value);
  const moves = moveDate.map(element => element.value);
  const moveDates = moveDate.map(element => element.date);
  displayMovement(moves, moveDates, window.currentAccount.locale);
};

const sortMovementsDescending = function () {
  const moveDate = createMoveDate();
  moveDate.sort((a, b) => b.value - a.value);
  const moves = moveDate.map(element => element.value);
  const moveDates = moveDate.map(element => element.date);
  displayMovement(moves, moveDates, window.currentAccount.locale);
};

const setLogoutTimer = function (timeout = 100) {
  let time = timeout;
  const tick = () => {
    const minute = Math.floor(time / 60);
    const second = Math.trunc(time % 60);
    labelTimer.textContent = `${String(minute).padStart(2, 0)}:${String(
      second
    ).padStart(2, 0)}`;
    if (time === 0) {
      clearInterval(logoutTimer);
      logoutUser();
    }
    time--;
  };
  tick();
  const logoutTimer = setInterval(tick, 1000);
  return logoutTimer;
};

btnLogin.addEventListener('click', function (event) {
  event.preventDefault();
  if (window.dateTimer) {
    clearInterval(window.dateTimer);
    delete window.dateTimer;
  }
  loginInit();
});

btnTransfer.addEventListener('click', function (event) {
  event.preventDefault();
  fundTransfer(inputTransferTo.value, Number(inputTransferAmount.value));
});

btnLoan.addEventListener('click', function (event) {
  event.preventDefault();
  issueLoan(inputLoanAmount.value);
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

btnClose.addEventListener('click', function (event) {
  event.preventDefault();
  closeAccount(inputCloseUsername.value, Number(inputClosePin.value));
});

btnSort.addEventListener('click', function (event) {
  if (!btnSort.value) {
    sortMovementsAscending();
    btnSort.value = 'ascending';
  } else if (btnSort.value === 'ascending') {
    sortMovementsDescending();
    btnSort.value = 'descending';
  } else {
    displayMovement(
      window.currentAccount.movements,
      window.currentAccount.movementsDates,
      window.currentAccount.locale
    );
    btnSort.value = '';
  }
});

document.querySelector('body').addEventListener('click', () => {
  if (window.logoutTimer) {
    clearInterval(window.logoutTimer);
    window.logoutTimer = setLogoutTimer(100);
  }
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

///////////////// Number types ///////////////
/*
console.log(0.1 + 0.2);
console.log(typeof 23);
console.log(typeof +'23');
console.log(typeof Number('23'));
console.log(typeof Number.parseFloat('23'));
console.log(Number.parseFloat('    2.3XX   '));
console.log(Number.parseFloat('XX23$'));
console.log(Number.parseInt('    2.3XX   '));
console.log(Number.isNaN(Number.parseFloat('XX23$')));
console.log(Number.isNaN('23'));
console.log(Number.isNaN(23 / 0));
console.log(Number.isFinite(Number.parseFloat('XX23$')));
console.log(Number.isFinite('23'));
console.log(Number.isFinite(23 / 0));
console.log(Number.isFinite(2));
console.log(Number.isInteger(2.0));
console.log(Number.isInteger(2.3));
console.log(Number.isInteger('23'));
*/
////////////////////// Operations ////////////////////
/*
console.log(Math.sqrt(49));
console.log(49 ** (1 / 2));
console.log(27 ** (1 / 3));
console.log(Math.trunc(2.9));
console.log(Math.round(2.9));
console.log(Math.round(2.3));
console.log(Math.ceil('2.3'));
console.log(Math.floor(2.9));
console.log(Math.trunc(-3.9));
console.log(Math.floor(-3.9));
console.log((2.3474782973).toFixed(2));
*/
////////////////////// Remainder operator /////////////////
/*
const nums = Array.from({ length: 100 }, (_, b) => {
  return b;
});
console.log(nums.filter(num => num % 2 === 0));

labelBalance.addEventListener('click', () => {
  Array.from(document.querySelectorAll('.movements__row')).forEach(
    (value, index) => {
      if (index % 3 === 0) value.style.background = 'green';
    }
  );
});
*/
//////////////////// Big int ////////////////////
/*
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(Number.MIN_SAFE_INTEGER);
*/

////////////////// Dates /////////////////////
/*
console.log(new Date(Date.UTC(2021, 6, 26, 12, 0)).toLocaleString('en-GB'));
const dates = account1.movementsDates.slice();
console.log(dates);
dates.sort((a, b) => {
  return new Date(b).getTime() - new Date(a).getTime();
});
console.log(dates);
*/
