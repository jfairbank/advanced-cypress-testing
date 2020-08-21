# Advanced Cypress Testing

Demo application for the Advanced Cypress Testing talk.

## Install Dependencies

### Server

```
$ cd server
$ yarn
```

### React App

```
$ cd app
$ yarn
```

## Run Demo

### Start Server

```
$ cd server
$ yarn start
```

### Start React App

```
$ cd app
$ yarn start
```

Visit http://localhost:3000 in your browser.

Use fake credentials to login:

* **Email:** `ebrown@jigowatts.com`
* **Password:** `GreatScott!`

## Run App for tests

### Start Server

```
$ cd server
$ yarn start:test
```

### Start React App

```
$ cd app
$ yarn start
```

### Start Cypress

#### Headless:

```
$ cd app
$ yarn e2e
```

#### Or interactive:

```
$ cd app
$ yarn e2e:open
```
