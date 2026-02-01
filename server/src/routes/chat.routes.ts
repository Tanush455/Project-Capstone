import e, { Router } from "express";
import { AichatSendMessage } from "../contollers/chatControllers";

const ChatRouter = Router();

ChatRouter.post('/send', AichatSendMessage);

export default ChatRouter;