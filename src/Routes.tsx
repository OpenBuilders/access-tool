import {
  AddBotToChatPage,
  ChannelPage,
  CheckingBotAddedPage,
  MainPage,
  NewConditionPage,
  GrantPermissionsPage,
  BotAddedSuccessPage,
} from '@pages'
import { Route, Routes } from 'react-router-dom'

export const ROUTES_NAME = {
  MAIN: '/',
  ADD_TELEGRAM_CHAT: '/admin/add-telegram-chat',
  CHAT_ADD_SUCCESS: '/admin/chat-add-success',
  CHAT_ADD_FAILURE: '/admin/chat-add-failure',
  CHANNEL: '/admin/channel/:channelSlug',
  CHANNEL_CONDITION: '/admin/channel/:channelSlug/condition/:conditionId',
  GRANT_PERMISSIONS: '/admin/grant-permissions/:channelSlug',
  CHECKING_BOT_ADDED: '/admin/checking-bot-added/:channelSlug',
  BOT_ADDED_SUCCESS: '/admin/bot-added-success/:channelSlug',
}

export default (
  <Routes>
    <Route path={ROUTES_NAME.MAIN} element={<MainPage />} />
    <Route
      path={ROUTES_NAME.ADD_TELEGRAM_CHAT}
      element={<AddBotToChatPage />}
    />
    <Route path={ROUTES_NAME.CHANNEL} element={<ChannelPage />} />
    <Route
      path={ROUTES_NAME.CHANNEL_CONDITION}
      element={<NewConditionPage />}
    />
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
