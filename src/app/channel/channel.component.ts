import { Component, inject, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from '../main/main.component';
import { Channel } from '../../models/channel.class';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {

  @Input() channel: Channel
  @Input() channelName: string = ''
 
  
}
