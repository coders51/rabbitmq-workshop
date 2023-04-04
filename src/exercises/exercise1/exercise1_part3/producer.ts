import { connect, ConsumeMessage } from "amqplib";
import { random } from "lodash";

random();
export function yyz(m: ConsumeMessage) {
  console.log(m);
}

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
  let cont = 0;
  while (true) {
    if (cont == 3) cont = 1;
    else cont++;
    const msg = `messaggio` + cont;
    const rk = cont;
    channel.publish(exchangeName, rk.toString(), Buffer.from(msg));
    console.log("Sent: ", msg, "with key = " + rk);
    await wait(1000);
  }
  await connection.close();
}

main().then(
  () => console.log("OK!"),
  err => console.log("Error: ", err)
);
