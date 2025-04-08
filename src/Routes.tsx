import {
  AddBotToChatPage,
  ChatPage,
  CheckingBotAddedPage,
  MainPage,
  ConditionPage,
  GrantPermissionsPage,
  BotAddedSuccessPage,
} from '@pages'
import { Route, Routes } from 'react-router-dom'

export const ROUTES_NAME = {
  MAIN: '/',
  ADD_TELEGRAM_CHAT: '/admin/add-telegram-chat',
  CHAT: '/admin/chat/:chatSlug',
  CHAT_CONDITION: '/admin/chat/:chatSlug/condition/:conditionId/:conditionType',
  CHAT_NEW_CONDITION: '/admin/chat/:chatSlug/new-condition/:conditionType',
  GRANT_PERMISSIONS: '/admin/grant-permissions/:chatSlug',
  CHECKING_BOT_ADDED: '/admin/checking-bot-added/:chatSlug',
  BOT_ADDED_SUCCESS: '/admin/bot-added-success/:chatSlug',
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
      path={ROUTES_NAME.CHECKING_BOT_ADDED}
      element={<CheckingBotAddedPage />}
    />
    <Route
      path={ROUTES_NAME.BOT_ADDED_SUCCESS}
      element={<BotAddedSuccessPage />}
    />
  </Routes>
)
