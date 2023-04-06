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
      order: { type: "string", default: "orderName" },
    })
    .parseSync();
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "orderErrEx";
  await channel.assertExchange(exchangeName, "fanout");
  let count = 0;
  while (true) {
    let orderId = random(1000, 10000)
    let total = random(1,100)
    const message = { type: argv.order, orderId: orderId, total: total };
    const jsonMessage = JSON.stringify(message);
    const rk = `rk${count + 1}`;
    channel.publish(exchangeName, rk.toString(), Buffer.from(jsonMessage));
    console.log("Sent order: " + argv.order + ", id: " + orderId + ", total: " + total +  ", rk: " + rk);
    await wait(1000);
    count = (count + 1) % 3;
  }
  await connection.close();
}

main().then(
  () => console.log("OK!"),
  err => console.log("Error: ", err)
);