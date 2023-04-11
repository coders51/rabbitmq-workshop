import { connect } from "amqplib";
import { random } from "lodash";
import yargs from "yargs";

random();

export function wait(timeout: number) {
  return new Promise((res, _) => {
    return setTimeout(res, timeout);
  });
}

async function main() {
  const argv = yargs(process.argv.slice(2))
    .options({
      exchange: { type: "string", default: "shipmentExchange" },
    })
    .parseSync();
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = argv.exchange;
  await channel.assertExchange(exchangeName, "topic");

  while (true) {
    const message = "inserted a new order";
    const rk = "order_inserted";
    channel.publish(exchangeName, rk, Buffer.from(message));
    console.log("New order inserted");
    await wait(1000);
  }
  await connection.close();
}

main().then(
  () => console.log("OK!"),
  err => console.log("Error: ", err)
);
