// import { Injectable } from '@angular/core';
// import { DatabaseService } from '../../database.service';
// import { Conversation } from '../../../models/conversation.class';
// import { User } from '../../../models/user.class';

// @Injectable({
//   providedIn: 'root'
// })
// export class LoadUserDataService {
//   userId = 'Adxrm7CExizb76lVrknu';
//   userName = 'Simon Weirauch';
//   conversationId = 'CONV-HTMknmA28FP56EIqrtZo-0.4380479343879251';
//   user: User;

//   specific: Conversation;
//   sendingUser: User;
//   passiveUser: User;

//   constructor(private data: DatabaseService) {}

//   loadUserData(): Promise<void> {
//     return this.data.loadUser(this.userId).then(user => {
//       this.user = user;

//       return this.data.loadSpecificUserConversation(this.userId, this.conversationId)
//         .then(conversation => {
//           this.specific = conversation;
//           console.log('this is the searched Conversation', this.specific);

//           return Promise.all([
//             this.data.loadUser(this.specific.createdBy).then(creatorUser => {
//               if (creatorUser.userId === this.user.userId) {
//                 this.sendingUser = creatorUser;
//               } else {
//                 this.passiveUser = creatorUser;
//               }
//               console.log('this is the creatorUser', creatorUser);
//             }),
//             this.data.loadUser(this.specific.recipientId).then(recipientUser => {
//               if (recipientUser.userId === this.user.userId) {
//                 this.sendingUser = recipientUser;
//               } else {
//                 this.passiveUser = recipientUser;
//               }
//               console.log('this is the recipientUser', recipientUser);
//             })
//           ]).then(() => undefined);  // Hier sicherstellen, dass wir ein Promise<void> zurückgeben
//         });
//     });
//   }
// }

