import { connect } from "amqplib";
import { random } from "lodash";
import yargs from "yargs";

random();

async function main() {
  let total_amended = 0;
  const argv = yargs(process.argv.slice(2))
    .options({
      queue: { type: "string", default: "malfunctionStream" },
    })
    .parseSync();
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "shipmentExchange";
  await channel.assertExchange(exchangeName, "topic");
  const { queue } = await channel.assertQueue(argv.queue, {
    durable: true,
    exclusive: false,
    autoDelete: false,
    arguments: { "x-queue-type": "stream" },
  });
  channel.bindQueue(queue, exchangeName, "order_amended");
  await channel.prefetch(1);
  channel.consume(
    queue,
    async msg => {
      if (!msg) {
        return;
      }
      const order = JSON.parse(msg.content.toString());
      if (order.type == "order_amended") total_amended++;
      console.log("Total amended orders: " + total_amended);
      channel.ack(msg, false);
    },
    { arguments: { "x-stream-offset": "first" } }
  );
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
