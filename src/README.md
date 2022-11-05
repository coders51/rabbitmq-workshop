# RabbitMQ Workshop Example

We are using [asdf](https://asdf-vm.com/) with [nodejs plugin](https://github.com/asdf-vm/asdf-nodejs) and [docker-compose](https://docs.docker.com/compose/) to spin-up a RabbitMQ instancies.

Run the docker-compose:

```shell
$ docker-compose up -d
```

Install the libraries with:

```shell
$ npm install
```

Run the producer with:

```shell
$ npx ts-node src/producer.ts
```

and in another console:

```shell
npx ts-node src/consumer.ts q1
```

You have to create `q1` manually.
