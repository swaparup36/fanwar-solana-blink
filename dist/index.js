"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const actions_1 = require("@solana/actions");
const web3_js_1 = require("@solana/web3.js");
const dotenv = __importStar(require("dotenv"));
const generate_unique_id_1 = __importDefault(require("generate-unique-id"));
const client_1 = require("@prisma/client");
dotenv.config();
const PORT = process.env.PORT || 8080;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const prisma = new client_1.PrismaClient();
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = {
        icon: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
        title: "demo blink",
        description: "demo blink tutorial",
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
    res.set(actions_1.ACTIONS_CORS_HEADERS);
    return res.json(response);
}));
app.get("/:gameid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.set(actions_1.ACTIONS_CORS_HEADERS);
    const gameId = req.params.gameid;
    const game = yield prisma.game.findFirst({
        where: {
            gameid: gameId,
        },
    });
    if (!game) {
        console.log("game not found");
        const gameNotFoundResponse = {
            icon: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
            title: "demo blink",
            description: `Visit ${process.env.BASE_URL} to create a new game`,
            disabled: true,
            label: `No Game was found with id ${gameId}`,
            error: {
                message: `No Game was found with id ${gameId}`
            },
            // links: {
            //   actions: [
            //     {
            //       href: '/',
            //       label: "Create new Fan war",
            //       type: "message"
            //     }
            //   ]
            // }
        };
        return res.json(gameNotFoundResponse);
    }
    ;
    let voterList1 = game === null || game === void 0 ? void 0 : game.voted_option1;
    let voterList2 = game === null || game === void 0 ? void 0 : game.voted_option2;
    if (!voterList1) {
        voterList1 = [];
    }
    if (!voterList2) {
        voterList2 = [];
    }
    const votedOpt1Count = (game === null || game === void 0 ? void 0 : game.voted_option1) ? game === null || game === void 0 ? void 0 : game.voted_option1.length : 0;
    const votedOpt2Count = (game === null || game === void 0 ? void 0 : game.voted_option2) ? game === null || game === void 0 ? void 0 : game.voted_option2.length : 0;
    const votedOpt1Percentage = (votedOpt1Count / (votedOpt1Count + votedOpt2Count) * 100).toFixed(2);
    const votedOpt2Percentage = (votedOpt2Count / (votedOpt1Count + votedOpt2Count) * 100).toFixed(2);
    const gameExpiredResponse = {
        icon: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
        title: "demo blink",
        description: "This War is Expired",
        label: "This War is Expired",
        disabled: true,
        links: {
            actions: [
                {
                    type: "post",
                    href: "/",
                    label: `${game === null || game === void 0 ? void 0 : game.option1} ${votedOpt1Percentage}%`,
                },
                {
                    type: "post",
                    href: "/",
                    label: `${game === null || game === void 0 ? void 0 : game.option2} ${votedOpt2Percentage}%`,
                },
            ]
        }
    };
    if (new Date((game === null || game === void 0 ? void 0 : game.created_on.getTime()) + (game === null || game === void 0 ? void 0 : game.duration) * 3600) > new Date()) {
        return res.json(gameExpiredResponse);
    }
    const response = {
        icon: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
        title: "demo blink",
        description: "demo blink tutorial",
        label: "Vote for 0.02 SOL",
        links: {
            actions: [
                {
                    type: "post",
                    href: `/vote/${gameId}`,
                    label: "Vote for 0.02 SOL",
                }
            ]
        }
    };
    return res.json(response);
}));
app.post("/vote/:gameid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.set(actions_1.ACTIONS_CORS_HEADERS);
    const gameId = req.params.gameid;
    const game = yield prisma.game.findFirst({
        where: {
            gameid: gameId,
        },
    });
    const postRequest = yield req.body;
    const userPubkey = postRequest.account;
    console.log("user publickey: ", userPubkey);
    let voterList1 = game === null || game === void 0 ? void 0 : game.voted_option1;
    let voterList2 = game === null || game === void 0 ? void 0 : game.voted_option2;
    if (!voterList1) {
        voterList1 = [];
    }
    if (!voterList2) {
        voterList2 = [];
    }
    const votedOpt1Count = (game === null || game === void 0 ? void 0 : game.voted_option1) ? game === null || game === void 0 ? void 0 : game.voted_option1.length : 0;
    const votedOpt2Count = (game === null || game === void 0 ? void 0 : game.voted_option2) ? game === null || game === void 0 ? void 0 : game.voted_option2.length : 0;
    const votedOpt1Percentage = (votedOpt1Count / (votedOpt1Count + votedOpt2Count) * 100).toFixed(2);
    const votedOpt2Percentage = (votedOpt2Count / (votedOpt1Count + votedOpt2Count) * 100).toFixed(2);
    const userExistResponse = {
        type: "post",
        message: `Already voted! Share this link to invite friends - ${process.env.BASE_URL}/${gameId}`,
        links: {
            next: {
                type: "inline",
                action: {
                    icon: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
                    description: `Already voted! Share this link to invite friends - ${process.env.BASE_URL}/${gameId}`,
                    error: {
                        message: "You have already voted"
                    },
                    disabled: true,
                    label: "click me!",
                    title: "blink on solana by swappy",
                    type: "action",
                    links: {
                        actions: [
                            {
                                type: "post",
                                href: "/",
                                label: `${game === null || game === void 0 ? void 0 : game.option1} ${votedOpt1Percentage}%`,
                            },
                            {
                                type: "post",
                                href: "/",
                                label: `${game === null || game === void 0 ? void 0 : game.option2} ${votedOpt2Percentage}%`,
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
    }
    else if (voterList2.indexOf(userPubkey) !== -1) {
        console.log("user already voted");
        return res.send(userExistResponse);
    }
    else {
        const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"));
        if (!process.env.ESCROW_PUBLIC_KEY) {
            const errorRes = {
                message: "Escrow publickey not found - contact developer",
            };
            res.set(actions_1.ACTIONS_CORS_HEADERS);
            return res.send(errorRes);
        }
        const transferSolIx = web3_js_1.SystemProgram.transfer({
            fromPubkey: new web3_js_1.PublicKey(userPubkey),
            toPubkey: new web3_js_1.PublicKey(process.env.ESCROW_PUBLIC_KEY),
            lamports: 200000000,
        });
        const tx = new web3_js_1.Transaction();
        tx.add(transferSolIx);
        tx.feePayer = new web3_js_1.PublicKey(userPubkey);
        tx.recentBlockhash = (yield connection.getLatestBlockhash({ commitment: "finalized" })).blockhash;
        const serialTx = tx
            .serialize({ requireAllSignatures: false, verifySignatures: false })
            .toString("base64");
        const response = {
            type: "transaction",
            transaction: serialTx,
            message: `Share this link to invite friends - ${process.env.BASE_URL}/${gameId}`,
            links: {
                next: {
                    type: "inline",
                    action: {
                        icon: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
                        description: `Share this link to invite friends - ${process.env.BASE_URL}/${gameId}`,
                        label: "Vote for 0.02 SOL",
                        title: "blink on solana by swappy",
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
                                                    label: `${game === null || game === void 0 ? void 0 : game.option1}`,
                                                    value: `${game === null || game === void 0 ? void 0 : game.option1}`,
                                                },
                                                {
                                                    label: `${game === null || game === void 0 ? void 0 : game.option2}`,
                                                    value: `${game === null || game === void 0 ? void 0 : game.option2}`,
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
}));
app.post("/choose/:gameid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const choosen_hero = req.body.data.choosen_hero;
    console.log(choosen_hero);
    const postRequest = yield req.body;
    const userPubkey = postRequest.account;
    console.log("user publickey: ", userPubkey);
    const gameId = req.params.gameid;
    const game = yield prisma.game.findFirst({
        where: {
            gameid: gameId,
        },
    });
    let dbResponse = null;
    let voterList1 = game === null || game === void 0 ? void 0 : game.voted_option1;
    let voterList2 = game === null || game === void 0 ? void 0 : game.voted_option2;
    if (!voterList1) {
        voterList1 = [];
    }
    if (!voterList2) {
        voterList2 = [];
    }
    if (voterList1.indexOf(userPubkey) !== -1) {
        console.log("user already voted");
        const errorRes = {
            message: "user already voted",
        };
        return res.json(errorRes);
    }
    else if (voterList2.indexOf(userPubkey) !== -1) {
        console.log("user already voted");
        const errorRes = {
            message: "user already voted",
        };
        return res.json(errorRes);
    }
    else {
        if (choosen_hero === (game === null || game === void 0 ? void 0 : game.option1)) {
            voterList1.push(userPubkey);
            dbResponse = yield prisma.game.update({
                where: {
                    gameid: gameId,
                },
                data: {
                    voted_option1: voterList1,
                },
            });
        }
        else {
            voterList2.push(userPubkey);
            dbResponse = yield prisma.game.update({
                where: {
                    gameid: gameId,
                },
                data: {
                    voted_option2: voterList2,
                },
            });
        }
    }
    const votedOpt1Count = (game === null || game === void 0 ? void 0 : game.voted_option1) ? game === null || game === void 0 ? void 0 : game.voted_option1.length : 0;
    const votedOpt2Count = (game === null || game === void 0 ? void 0 : game.voted_option2) ? game === null || game === void 0 ? void 0 : game.voted_option2.length : 0;
    const votedOpt1Percentage = (votedOpt1Count / (votedOpt1Count + votedOpt2Count) * 100).toFixed(2);
    const votedOpt2Percentage = (votedOpt2Count / (votedOpt1Count + votedOpt2Count) * 100).toFixed(2);
    console.log("update vote db response: ", dbResponse);
    const response = {
        type: "post",
        message: `Share this link to invite friends - ${process.env.BASE_URL}/${gameId}`,
        links: {
            next: {
                type: "inline",
                action: {
                    icon: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
                    description: `Share this link to invite friends - ${process.env.BASE_URL}/${gameId}`,
                    label: "click me!",
                    title: "blink on solana by swappy",
                    type: "action",
                    links: {
                        actions: [
                            {
                                type: "post",
                                href: "/",
                                label: `${game === null || game === void 0 ? void 0 : game.option1} ${votedOpt1Percentage}%`,
                            },
                            {
                                type: "post",
                                href: "/",
                                label: `${game === null || game === void 0 ? void 0 : game.option2} ${votedOpt2Percentage}%`,
                            },
                        ],
                    },
                },
            },
        },
    };
    res.set(actions_1.ACTIONS_CORS_HEADERS);
    return res.json(response);
}));
app.post("/set-duration/:gameid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const duration = req.body.data.choosen_duration;
    const postRequest = yield req.body;
    const userPubkey = postRequest.account;
    const gameId = req.params.gameid;
    const game = yield prisma.game.findFirst({
        where: {
            gameid: gameId,
        },
    });
    const dbResponse = yield prisma.game.update({
        where: {
            gameid: gameId,
        },
        data: {
            duration: parseInt(duration),
        },
    });
    console.log("set duration db response: ", dbResponse);
    const response = {
        type: "post",
        links: {
            next: {
                type: "inline",
                action: {
                    icon: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
                    description: "a demo blink",
                    label: "click me!",
                    title: "blink on solana by swappy",
                    type: "action",
                    links: {
                        actions: [
                            {
                                type: "post",
                                href: `/vote/${gameId}`,
                                label: "Vote for 0.02 SOL",
                            }
                        ],
                    },
                },
            },
        },
        message: `You choose a duration of ${duration}`,
    };
    res.set(actions_1.ACTIONS_CORS_HEADERS);
    return res.json(response);
}));
app.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const option1 = req.body.data.option1;
    const option2 = req.body.data.option2;
    const postRequest = yield req.body;
    const gameId = (0, generate_unique_id_1.default)({
        length: 16,
    });
    const userPubkey = postRequest.account;
    console.log(`user ${userPubkey} created a fan-war of ${option1} v/s ${option2} with game id ${gameId}`);
    const dbResponse = yield prisma.game.create({
        data: {
            gameid: gameId,
            created_on: new Date(),
            option1: option1,
            option2: option2,
            duration: 5,
        },
    });
    console.log("new game create response: ", dbResponse);
    const response = {
        type: "post",
        links: {
            next: {
                type: "inline",
                action: {
                    icon: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
                    description: "a demo blink",
                    label: "click me!",
                    title: "blink on solana by swappy",
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
    res.set(actions_1.ACTIONS_CORS_HEADERS);
    return res.json(response);
}));
app.options("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.set(actions_1.ACTIONS_CORS_HEADERS);
    return res.send(null);
}));
app.listen(PORT, () => console.log(`app running on port ${PORT}`));
