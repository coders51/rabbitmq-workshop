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

/**
 * direct
 */
async function main() {
  const conn = await connect("amqp://localhost");
  const ch = await conn.createChannel();
  const exName = "ex-dir";
  await ch.assertExchange(exName, "direct");
  let count = 0;
  while (true) {
    const rk = `rk${count + 1}`;
    const ret = ch.publish(exName, rk, Buffer.from("Ciao ciao" + count));
    console.log("Published ", rk, ret);
    await wait(1000);
    count = (count + 1) % 3;
  }
  await conn.close();
}

/**
 * fan out
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createChannel();
//   const exName = "ex-fan";
//   await ch.assertExchange(exName, "fanout");
//   let count = 0;
//   while (true) {
//     const rk = `rk${count + 1}`;
//     const ret = ch.publish(exName, rk, Buffer.from("Ciao ciao" + count));
//     console.log("Published ", rk, ret);
//     await wait(1000);
//     count = (count + 1) % 3;
//   }
//   await conn.close();
// }

/**
 * topic
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createChannel();
//   const exName = "ex-topic";
//   await ch.assertExchange(exName, "topic");
//   let type = 0;
//   let count = 0;
//   let xxx = -1;
//   while (true) {
//     const rk = `${process.argv[2]}.type${type + 1}.rk${count + 1}`;
//     const ret = ch.publish(exName, rk, Buffer.from("Ciao ciao " + rk));
//     console.log("Published ", rk, ret);
//     await wait(1000);
//     count = (count + 1) % 3;
//     xxx = (xxx + 1) % 3;
//     type = (type + Math.floor(xxx / 2)) % 3;
//   }
//   await conn.close();
// }

/**
 * Send and close
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createChannel();
//   const ret = ch.publish("ex-dir", "gino", Buffer.from("Ciao ciao"));
//   console.log("Published ", ret);
//   await wait(1000);
//   // await ch.waitForConfirms();
//   await conn.close();
// }

/**
 * Publish confirmation
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createConfirmChannel();
//   for (let index = 0; index > -1; index++) {
//     ch.publish("ex-dir", "gino", Buffer.from("Ciao ciao" + index));
//     if (index % 1000 === 0) {
//       await ch.waitForConfirms();
//     }
//   }
//   // await wait(1000);
//   // await ch.waitForConfirms();
//   await conn.close();
// }

/**
 * Publish for Prefetch
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createConfirmChannel();
//   const content = Buffer.alloc(1024 * 1024, 6);
//   for (let index = 0; index > -1; index++) {
//     ch.publish("ex-dir", "gino", content);
//     if (index % 1000 === 0) {
//       await ch.waitForConfirms();
//       console.log("confirmed");
//     }
//   }
//   // await wait(1000);
//   await ch.waitForConfirms();
//   await conn.close();
// }

/**
 * DLQ - Produce with a wrong RK
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createConfirmChannel();
//   for (let index = 0; index > -1; index++) {
//     // const rk = "gino.pino.tino";
//     const rk = random(1, 10) % 2 ? "gino.pino.lino" : "gino.pino.tino";
//     const ret = ch.publish("ex-topic", rk, Buffer.from(rk), {
//       persistent: true,
//     });
//     await ch.waitForConfirms();
//     // await wait(1000);
//     console.log("Sent ", rk, ret);
//   }
//   await ch.waitForConfirms();
//   await conn.close();
// }

/**
 * DLQ - Produce with a wrong RK - Mandatory
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createConfirmChannel();
//   // const content = Buffer.alloc(1024 * 1024, 6);
//   ch.on("return", (msg: ConsumeMessage) =>
//     console.log(">>> err", msg.fields, msg.content.toString())
//   );
//   for (let index = 0; index > -1; index++) {
//     // const rk = "gino.pino.lino"
//     const rk = random(1, 10) % 2 ? "gino.pino.lino" : "gino.pino.tino";
//     const ret = ch.publish("ex-topic", rk, Buffer.from(rk), {
//       // mandatory: true,
//     });
//     await ch.waitForConfirms();
//     await wait(1000);
//     console.log("Sent ", rk, ret);
//   }
//   await ch.waitForConfirms();
//   await conn.close();
// }

/**
 * Stream producer
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createConfirmChannel();
//   for (let index = 0; index > -1; index++) {
//     // const rk = "gino.pino.lino"
//     // const rk = random(1, 10) % 2 ? "gino.pino.lino" : "gino.pino.tino";
//     const ret = ch.publish("ex-stream", "", Buffer.from("stream" + index), {
//       // mandatory: true,
//     });
//     if (index % 1000 === 0) {
//       await ch.waitForConfirms();
//       console.log("Sent ", ret);
//     }
//   }
//   await ch.waitForConfirms();
//   await conn.close();
// }

main().then(
  () => console.log("OK!"),
  (err) => console.log("Error: ", err)
);
