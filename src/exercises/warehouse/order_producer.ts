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
    if (random(1, 50) % 2 == 0) {
      let orderId = random(1000, 10000);
      let total = random(1, 50);
      const message = { type: "order_amended", orderId: orderId, total: total };
      const jsonMessage = JSON.stringify(message);
      const rk = "order_amended";
      channel.publish(exchangeName, rk, Buffer.from(jsonMessage));
      console.log("Order amended");
    } else {
      const message = { type: "order_inserted" };
      const jsonMessage = JSON.stringify(message);
      const rk = "order_inserted";
      channel.publish(exchangeName, rk, Buffer.from(jsonMessage));
      console.log("New order inserted");
    }
    await wait(1000);
  }
  await connection.close();
}

main().then(
  () => console.log("OK!"),
  err => console.log("Error: ", err)
);
