import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { LoginComponent } from './login/login.component';
import { ChannelComponent } from './channel/channel.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { DialogChooseAvatarComponent } from './dialog-choose-avatar/dialog-choose-avatar.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'chat', component: ChatComponent },
    { path: 'channel', component: ChannelComponent},
    { path: 'imprint', component: ImprintComponent},
    { path: 'privacyPolicy', component: PrivacyPolicyComponent},
    { path: 'signUp', component: SignUpComponent},
    { path: 'choosingAvatar', component: DialogChooseAvatarComponent}
];
