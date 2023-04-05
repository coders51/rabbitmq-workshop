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
  const exchangeName = "fanoutExchange";
  await channel.assertExchange(exchangeName, "fanout");
  //in case multiple consumer instances are created,
  //each instance will have a temporary queue from which it will receive all messages sent by the producer
  const { queue } = await channel.assertQueue("", { autoDelete: true, durable: false });
  console.log(" [*] Waiting for messages in queue: " + queue + " - To exit press CTRL+C");
  channel.bindQueue(queue, exchangeName, "");
  channel.consume(queue, msg => console.log(msg?.content.toString()));
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
