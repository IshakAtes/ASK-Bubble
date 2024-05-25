import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { LoginComponent } from './login/login.component';
import { ChannelComponent } from './channel/channel.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'chat', component: ChatComponent },
    { path: 'channel', component: ChannelComponent}
];
