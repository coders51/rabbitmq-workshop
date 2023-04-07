import { connect } from "amqplib";
import { random, } from "lodash";
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
      order: { type: "string", default: "orderName" },
      exchange: { type: "string", default: "orderErrExchange" },
    })
    .parseSync();
  const connection = await connect("amqp://localhost");
  const channel = await connection.createConfirmChannel();
  const exchangeName = argv.exchange;
  await channel.assertExchange(exchangeName, "topic");
  while (true) {
    let orderId = random(1000, 10000)
    let total = random(1,100)
    const message = { type: argv.order, orderId: orderId, total: total };
    const jsonMessage = JSON.stringify(message);
    const rk = argv.order;
    channel.publish(exchangeName, rk, Buffer.from(jsonMessage), {
      persistent: true,
    });
    console.log("Sent order id: " + orderId + ", total: " + total + ", rk: " + rk );
    await wait(1000);
    await channel.waitForConfirms();
  }
  await connection.close();
}

main().then(
  () => console.log("OK!"),
  err => console.log("Error: ", err)
);