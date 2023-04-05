import { connect } from "amqplib";
import { random } from "lodash";

random();

export function wait(timeout: number) {
  return new Promise((res, _) => {
    return setTimeout(res, timeout);
  });
}

async function main() {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "exchangeDirect";
  await channel.assertExchange(exchangeName, "direct");
  let count = 0;
  while (true) {
    const message = `Message${count + 1}`;
    const rk = `rk${count + 1}`;
    channel.publish(exchangeName, rk, Buffer.from(message));
    console.log(`Sent: ${message} - with rk: ${rk}`);
    await wait(1000);
    count = (count + 1) % 3;
  }
  await connection.close();
}

main().then(
  () => console.log("OK!"),
  err => console.log("Error: ", err)
);
