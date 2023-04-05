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
  //se creo più istanze di consumer ognuna con una coda differente
  //ognuna riceverà tutti i messaggi del producer
  const { queue } = await channel.assertQueue("", {
    autoDelete: true,
    durable: false,
  });
  //se invece creo più istanze di consumer e associo a tutte la stessa coda
  //riceveranno i messaggi del producer in modo alternato
  /* const { queue } = await channel.assertQueue("nomeCoda", {
    autoDelete: true,
    durable: false,
  }); */
  console.log(
    " [*] Waiting for messages in queue: " + queue + " - To exit press CTRL+C"
  );
  channel.bindQueue(queue, exchangeName, "");
  channel.consume(queue, msg => console.log(msg?.content.toString()));
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
