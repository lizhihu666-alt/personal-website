import avatarUrl from '../assets/photos/leo-card-avatar.jpg';
import { WORK_DATA } from './portfolioData';

export const CONTACT_CARD_PROPS = {
  name: '胡利致',
  handle: 'Leo Hu',
  status: '商家入驻 · 项目运营 · AI 提效',
  contactText: '添加微信',
  avatarUrl,
  qrUrl: '/photos/wechat-qr.jpg',
  qrAlt: 'Leo Hu 的微信二维码',
  qrTitle: '胡利致',
  qrCaption: '扫码添加微信',
  qrFallbackText: `微信号：${WORK_DATA.contact.wechat}`,
  flipHint: '点击任意处翻回',
};
