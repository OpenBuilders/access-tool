import {
  AddBotToChatPage,
  ChatPage,
  MainPage,
  ConditionPage,
  GrantPermissionsPage,
  BotAddedSuccessPage,
  ClientTasksPage,
  ClientConnectedWalletPage,
  ClientWalletsListPage,
  ClientJoinPage,
  NotFound,
  ClientChatHidden,
} from '@pages'
import { Route, Routes } from 'react-router-dom'

export const ROUTES_NAME = {
  MAIN: '/',
  ADD_TELEGRAM_CHAT: '/admin/add-telegram-chat',
  CHAT: '/admin/chat/:chatSlug',
  CHAT_CONDITION: '/admin/chat/:chatSlug/condition/:conditionId/:conditionType',
  CHAT_NEW_CONDITION: '/admin/chat/:chatSlug/new-condition/:conditionType',
  GRANT_PERMISSIONS: '/admin/grant-permissions/:chatSlug',
  BOT_ADDED_SUCCESS: '/admin/bot-added-success/:chatSlug',
  CLIENT_TASKS: '/client/:clientChatSlug',
  CLIENT_CONNECTED_WALLET: '/client/:clientChatSlug/connected-wallet',
  CLIENT_WALLETS_LIST: '/client/:clientChatSlug/wallets-list',
  CLIENT_JOIN: '/client/:clientChatSlug/join',
  NOT_FOUND: '/not-found',
  CLIENT_CHAT_HIDDEN: '/chat-hidden',
}

export default (
  <Routes>
    <Route path={ROUTES_NAME.MAIN} element={<MainPage />} />
    <Route
      path={ROUTES_NAME.ADD_TELEGRAM_CHAT}
      element={<AddBotToChatPage />}
    />
    <Route path={ROUTES_NAME.CHAT} element={<ChatPage />} />
    <Route path={ROUTES_NAME.CHAT_CONDITION} element={<ConditionPage />} />
    <Route path={ROUTES_NAME.CHAT_NEW_CONDITION} element={<ConditionPage />} />
    <Route
      path={ROUTES_NAME.GRANT_PERMISSIONS}
      element={<GrantPermissionsPage />}
    />
    <Route
      path={ROUTES_NAME.BOT_ADDED_SUCCESS}
      element={<BotAddedSuccessPage />}
    />
    <Route path={ROUTES_NAME.CLIENT_TASKS} element={<ClientTasksPage />} />
    <Route
      path={ROUTES_NAME.CLIENT_CONNECTED_WALLET}
      element={<ClientConnectedWalletPage />}
    />
    <Route
      path={ROUTES_NAME.CLIENT_WALLETS_LIST}
      element={<ClientWalletsListPage />}
    />
    <Route path={ROUTES_NAME.CLIENT_JOIN} element={<ClientJoinPage />} />
    <Route path={ROUTES_NAME.NOT_FOUND} element={<NotFound />} />
    <Route
      path={ROUTES_NAME.CLIENT_CHAT_HIDDEN}
      element={<ClientChatHidden />}
    />
  </Routes>
)
