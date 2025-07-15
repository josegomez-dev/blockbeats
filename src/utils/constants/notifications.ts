import { v4 as uuidv4 } from "uuid";

export const NOTIFICATIONS = [
    {
        id: uuidv4(),
        text: "¡Welcome to BlockBeats!",
        link: "/dashboard",
        visited: false,
    },
    {
        id: uuidv4(),
        text: "¡Create your first (NFT) musical signature!",
        link: "/create",
        visited: false,
    },
    {
        id: uuidv4(),
        text: "¡Explore the WEB3 Market!",
        link: "/market",
        visited: false,
    },
];