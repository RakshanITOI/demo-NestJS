import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from '../entity/chat.entity';
import { Repository } from 'typeorm';
import { Room, User_chat } from '../dto/chat/chat.interface';

@Injectable()
export class ChatService {

  private rooms: Room[] = []
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
  ) { }

  async createMessage(chat: Chat): Promise<Chat> {
    return await this.chatRepository.save(chat);
  }
  
  async getMessages(): Promise<Chat[]> {
    return await this.chatRepository.find();
  }

  // for Room Chat

  async addRoom(roomName: string, host: User_chat): Promise<void> {
    const room = await this.getRoomByName(roomName)
    if (room === -1) {
      await this.rooms.push({ name: roomName, host, users: [host] })
    }
  }

  async removeRoom(roomName: string): Promise<void> {
    const findRoom = await this.getRoomByName(roomName)
    if (findRoom !== -1) {
      this.rooms = this.rooms.filter((room) => room.name !== roomName)
    }
  }

  async getRoomHost(hostName: string): Promise<User_chat> {
    const roomIndex = await this.getRoomByName(hostName)
    return this.rooms[roomIndex].host
  }

  async getRoomByName(roomName: string): Promise<number> {
    const roomIndex = this.rooms.findIndex((room) => room?.name === roomName)
    return roomIndex
  }

  async addUserToRoom(roomName: string, user: User_chat): Promise<void> {
    const roomIndex = await this.getRoomByName(roomName)
    if (roomIndex !== -1) {
      this.rooms[roomIndex].users.push(user)
      const host = await this.getRoomHost(roomName)
      if (host.userId === user.userId) {
        this.rooms[roomIndex].host.socketId = user.socketId
      }
    } else {
      await this.addRoom(roomName, user)
    }
  }

  async findRoomsByUserSocketId(socketId: string): Promise<Room[]> {
    const filteredRooms = this.rooms.filter((room) => {
      const found = room.users.find((user) => user.socketId === socketId)
      if (found) {
        return found
      }
    })
    return filteredRooms
  }

  async removeUserFromAllRooms(socketId: string): Promise<void> {
    const rooms = await this.findRoomsByUserSocketId(socketId)
    for (const room of rooms) {
      await this.removeUserFromRoom(socketId, room.name)
    }
  }

  async removeUserFromRoom(socketId: string, roomName: string): Promise<void> {
    const room = await this.getRoomByName(roomName)
    this.rooms[room].users = this.rooms[room].users.filter((user) => user.socketId !== socketId)
    if (this.rooms[room].users.length === 0) {
      await this.removeRoom(roomName)
    }
  }

  async getRooms(): Promise<Room[]> {
    return this.rooms
  }

}
