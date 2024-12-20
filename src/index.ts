import express, { Response, Request, Express, response } from "express";
import cors from "cors";
import {
  ActionError,
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import * as dotenv from "dotenv";
import generateUniqueId from "generate-unique-id";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const PORT = process.env.PORT || 8080;

const app: Express = express();

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Encoding'],
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
}));
app.use(express.json());
app.use('/static', express.static('public'));

const prisma = new PrismaClient();

app.get("/", async (req: Request, res: Response): Promise<any> => {
  const response: ActionGetResponse = {
    icon: `http://idox9ft.sufydely.com/logo.jpg`,
    title: "Fan War Blink",
    description: "Rivalry between fandoms - Enter two options to create a fan war",
    label: "click me!",
    links: {
      actions: [
        {
          type: "post",
          href: "/choose",
          label: "Vote",
          parameters: [
            {
              type: "radio",
              name: "choosen_hero",
              options: [
                {
                  label: "Ronaldo",
                  value: "Ronaldo",
                },
                {
                  label: "Messi",
                  value: "Messi",
                },
              ],
            },
          ],
        },
        {
          type: "post",
          href: "/create",
          label: "Create Fan War",
          parameters: [
            {
              type: "text",
              name: "option1",
              required: true,
            },
            {
              type: "text",
              name: "option2",
              required: true,
            },
          ],
        },
      ],
    },
  };

  res.set(ACTIONS_CORS_HEADERS);
  res.set({
    "X-Action-Version": "2.1.3",
    "X-Blockchain-Ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"
  });
  return res.json(response);
});

app.get("/:gameid", async (req: Request, res: Response): Promise<any> => {
  res.set(ACTIONS_CORS_HEADERS);
  res.set({
    "X-Action-Version": "2.1.3",
    "X-Blockchain-Ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"
  });
  res.set(ACTIONS_CORS_HEADERS);

  const gameId = req.params.gameid;

  const game = await prisma.game.findFirst({
    where: {
      gameid: gameId,
    },
  });

  if(!game) {
    console.log("game not found");
    const gameNotFoundResponse: ActionGetResponse = {
      icon: `http://idox9ft.sufydely.com/logo.jpg`,
      title: "Fan War Blink",
      description: `Visit ${process.env.BASE_URL} to create a new game`,
      disabled: true,
      label: `No Game was found with id ${gameId}`,
      error: {
        message: `No Game was found with id ${gameId}`
      }
    }

    return res.json(gameNotFoundResponse);
  };

  let voterList1 = game?.voted_option1;
  let voterList2 = game?.voted_option2;

  if (!voterList1) {
    voterList1 = [];
  }

  if (!voterList2) {
    voterList2 = [];
  }

  const votedOpt1Count = game?.voted_option1 ? game?.voted_option1.length : 0;
  const votedOpt2Count = game?.voted_option2 ? game?.voted_option2.length : 0;

  const votedOpt1Percentage = (votedOpt1Count / (votedOpt1Count + votedOpt2Count) * 100).toFixed(2);
  const votedOpt2Percentage = (votedOpt2Count / (votedOpt1Count + votedOpt2Count) * 100).toFixed(2);

  const gameExpiredResponse: ActionGetResponse = {
    icon: `http://idox9ft.sufydely.com/logo.jpg`,
    title: "Fan War Blink",
    description: "This War is Expired",
    label: "This War is Expired",
    disabled: true,
    links: {
      actions: [
        {
          type: "post",
          href: "/",
          label: `${game?.option1} ${votedOpt1Percentage}%`,
        },
        {
          type: "post",
          href: "/",
          label: `${game?.option2} ${votedOpt2Percentage}%`,
        },
      ]
    }
  };

  if(new Date(game?.created_on.getTime() + game?.duration * 3600) > new Date()) {
    return res.json(gameExpiredResponse)
  }

  const response: ActionGetResponse = {
    icon: `http://idox9ft.sufydely.com/logo.jpg`,
    title: "Fan War Blink",
    description: "Rivalry between fandoms - Vote your favourite",
    label: "Vote for 0.2 SOL",
    links: {
      actions: [
        {
          type: "post",
          href: `/vote/${gameId}`,
          label: "Vote for 0.2 SOL",
        }
      ]
    }
  };

  return res.json(response);
});

app.post("/vote/:gameid", async (req: Request, res: Response): Promise<any> => {
  res.set(ACTIONS_CORS_HEADERS);
  res.set({
    "X-Action-Version": "2.1.3",
    "X-Blockchain-Ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"
  });

  const gameId = req.params.gameid;

  const game = await prisma.game.findFirst({
    where: {
      gameid: gameId,
    },
  });

    const postRequest: ActionPostRequest = await req.body;

    const userPubkey = postRequest.account;
    console.log("user publickey: ", userPubkey);


    let voterList1 = game?.voted_option1;
    let voterList2 = game?.voted_option2;

    if (!voterList1) {
      voterList1 = [];
    }

    if (!voterList2) {
      voterList2 = [];
    }

    const votedOpt1Count = game?.voted_option1 ? game?.voted_option1.length : 0;
    const votedOpt2Count = game?.voted_option2 ? game?.voted_option2.length : 0;

    const votedOpt1Percentage = (votedOpt1Count / (votedOpt1Count + votedOpt2Count) * 100).toFixed(2);
    const votedOpt2Percentage = (votedOpt2Count / (votedOpt1Count + votedOpt2Count) * 100).toFixed(2);

    const userExistResponse: ActionPostResponse = {
      type: "post",
      message: `Already voted! Share this link to invite friends - ${process.env.BASE_URL}${gameId}`,
      links: {
        next: {
          type: "inline",
          action: {
            icon: `http://idox9ft.sufydely.com/logo.jpg`,
            description: `Already voted! Share this link to invite friends - ${process.env.BASE_URL}${gameId}`,
            error: {
              message: "You have already voted"
            },
            disabled: true,
            label: "click me!",
            title: "Fan War Blink",
            type: "action",
            links: {
              actions: [
                {
                  type: "post",
                  href: "/",
                  label: `${game?.option1} ${votedOpt1Percentage}%`,
                },
                {
                  type: "post",
                  href: "/",
                  label: `${game?.option2} ${votedOpt2Percentage}%`,
                },
              ],
            },
          },
        },
      },
    };

    if (voterList1.indexOf(userPubkey) !== -1) {
      console.log("user already voted");
      return res.send(userExistResponse);
    } else if (voterList2.indexOf(userPubkey) !== -1) {
      console.log("user already voted");
      return res.send(userExistResponse);
    }else {
      const connection = new Connection(clusterApiUrl("devnet"));

      if (!process.env.ESCROW_PUBLIC_KEY) {
        const errorRes: ActionError = {
          message: "Escrow publickey not found - contact developer",
        };

        res.set(ACTIONS_CORS_HEADERS);
        return res.send(errorRes);
      }

      const transferSolIx = SystemProgram.transfer({
        fromPubkey: new PublicKey(userPubkey),
        toPubkey: new PublicKey(process.env.ESCROW_PUBLIC_KEY),
        lamports: 200000000,
      });

      const tx = new Transaction();

      tx.add(transferSolIx);

      tx.feePayer = new PublicKey(userPubkey);
      tx.recentBlockhash = (
        await connection.getLatestBlockhash({ commitment: "finalized" })
      ).blockhash;
      const serialTx = tx
        .serialize({ requireAllSignatures: false, verifySignatures: false })
        .toString("base64");

      const response: ActionPostResponse = {
        type: "transaction",
        transaction: serialTx,
        message: `Share this link to invite friends - ${process.env.BASE_URL}${gameId}`,
        links: {
          next: {
            type: "inline",
            action: {
              icon: `http://idox9ft.sufydely.com/logo.jpg`,
              description: `Share this link to invite friends - ${process.env.BASE_URL}${gameId} and vote`,
              label: "Vote for 0.2 SOL",
              title: "Fan War Blink",
              type: "action",
              links: {
                actions: [
                  {
                    type: "post",
                    href: `/choose/${gameId}`,
                    label: "Choose",
                    parameters: [
                      {
                        type: "radio",
                        name: "choosen_hero",
                        options: [
                          {
                            label: `${game?.option1}`,
                            value: `${game?.option1}`,
                          },
                          {
                            label: `${game?.option2}`,
                            value: `${game?.option2}`,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      };
      return res.json(response);
    }
});

app.post(
  "/choose/:gameid",
  async (req: Request, res: Response): Promise<any> => {
    res.set(ACTIONS_CORS_HEADERS);
    res.set({
      "X-Action-Version": "2.1.3",
      "X-Blockchain-Ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"
    });

    const choosen_hero = req.body.data.choosen_hero;
    console.log(choosen_hero);
    const postRequest: ActionPostRequest = await req.body;

    const userPubkey = postRequest.account;
    console.log("user publickey: ", userPubkey);

    const gameId = req.params.gameid;

    const game = await prisma.game.findFirst({
      where: {
        gameid: gameId,
      },
    });

    let dbResponse = null;

    let voterList1 = game?.voted_option1;
    let voterList2 = game?.voted_option2;

    if (!voterList1) {
      voterList1 = [];
    }

    if (!voterList2) {
      voterList2 = [];
    }

    if (voterList1.indexOf(userPubkey) !== -1) {
      console.log("user already voted");
      const errorRes: ActionError = {
        message: "user already voted",
      };
      return res.json(errorRes);
    } else if (voterList2.indexOf(userPubkey) !== -1) {
      console.log("user already voted");
      const errorRes: ActionError = {
        message: "user already voted",
      };
      return res.json(errorRes);
    } else {
      if (choosen_hero === game?.option1) {
        voterList1.push(userPubkey);

        dbResponse = await prisma.game.update({
          where: {
            gameid: gameId,
          },
          data: {
            voted_option1: voterList1,
          },
        });
      } else {
        voterList2.push(userPubkey);

        dbResponse = await prisma.game.update({
          where: {
            gameid: gameId,
          },
          data: {
            voted_option2: voterList2,
          },
        });
      }
    }

    const votedOpt1Count = game?.voted_option1 ? game?.voted_option1.length : 0;
    const votedOpt2Count = game?.voted_option2 ? game?.voted_option2.length : 0;

    const votedOpt1Percentage = (votedOpt1Count / (votedOpt1Count + votedOpt2Count) * 100).toFixed(2);
    const votedOpt2Percentage = (votedOpt2Count / (votedOpt1Count + votedOpt2Count) * 100).toFixed(2);

    console.log("update vote db response: ", dbResponse);

    const response: ActionPostResponse = {
      type: "post",
      message: `Share this link to invite friends - ${process.env.BASE_URL}${gameId}`,
      links: {
        next: {
          type: "inline",
          action: {
            icon: "https://upload.wikimedia.org/wikipedia/en/b/b9/logo.png",
            description: `Share this link to invite friends - ${process.env.BASE_URL}${gameId}`,
            label: "click me!",
            title: "Fan War Blink",
            type: "action",
            disabled: true,
            links: {
              actions: [
                {
                  type: "post",
                  href: "/",
                  label: `${game?.option1} ${votedOpt1Percentage}%`,
                },
                {
                  type: "post",
                  href: "/",
                  label: `${game?.option2} ${votedOpt2Percentage}%`,
                },
              ],
            },
          },
        },
      },
    };

    return res.json(response);
  }
);

app.post(
  "/set-duration/:gameid",
  async (req: Request, res: Response): Promise<any> => {
    res.set(ACTIONS_CORS_HEADERS);
    res.set({
      "X-Action-Version": "2.1.3",
      "X-Blockchain-Ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"
    });
    const duration = req.body.data.choosen_duration;

    const postRequest: ActionPostRequest = await req.body;

    const userPubkey = postRequest.account;
    const gameId = req.params.gameid;

    const game = await prisma.game.findFirst({
      where: {
        gameid: gameId,
      },
    });

    const dbResponse = await prisma.game.update({
      where: {
        gameid: gameId,
      },
      data: {
        duration: parseInt(duration),
      },
    });
    console.log("set duration db response: ", dbResponse);

    const response: ActionPostResponse = {
      type: "post",
      links: {
        next: {
          type: "inline",
          action: {
            icon: `http://idox9ft.sufydely.com/logo.jpg`,
            description: "Rivalry between fandoms - Vote your favourite",
            label: "click me!",
            title: "Fan War Blink",
            type: "action",
            links: {
              actions: [
                {
                  type: "post",
                  href: `/vote/${gameId}`,
                  label: "Vote for 0.2 SOL",
                }
              ],
            },
          },
        },
      },
      message: `You choose a duration of ${duration}`,
    };

    return res.json(response);
  }
);

app.post("/create", async (req: Request, res: Response): Promise<any> => {
  res.set(ACTIONS_CORS_HEADERS);
  res.set({
    "X-Action-Version": "2.1.3",
    "X-Blockchain-Ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"
  });

  const option1 = req.body.data.option1;
  const option2 = req.body.data.option2;
  const postRequest: ActionPostRequest = await req.body;

  const gameId = generateUniqueId({
    length: 16,
  });

  const userPubkey = postRequest.account;
  console.log(
    `user ${userPubkey} created a fan-war of ${option1} v/s ${option2} with game id ${gameId}`
  );

  const dbResponse = await prisma.game.create({
    data: {
      gameid: gameId,
      created_on: new Date(),
      option1: option1,
      option2: option2,
      duration: 5,
    },
  });

  console.log("new game create response: ", dbResponse);

  const response: ActionPostResponse = {
    type: "post",
    links: {
      next: {
        type: "inline",
        action: {
          icon: `http://idox9ft.sufydely.com/logo.jpg`,
          description: "Rivalry between fandoms - Choose duration",
          label: "click me!",
          title: "Fan War Blink",
          type: "action",
          links: {
            actions: [
              {
                type: "post",
                href: `/set-duration/${gameId}`,
                label: "Set Time",
                parameters: [
                  {
                    type: "select",
                    name: "choosen_duration",
                    options: [
                      {
                        label: "5 hours",
                        value: "5",
                      },
                      {
                        label: "12 hours",
                        value: "12",
                      },
                      {
                        label: "24 hours",
                        value: "24",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
    },
    message: `Share this link to invite your friends - ${req.url}/${gameId}`,
  };

  return res.json(response);
});

app.options("/", async (req: Request, res: Response): Promise<any> => {
  res.set(ACTIONS_CORS_HEADERS);
  return res.send(null);
});

app.listen(PORT, () => console.log(`app running on port ${PORT}`));
