import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class InviteDto {
  @IsArray()
  @IsNotEmpty()
  userIds: number[];

  @IsString()
  @IsNotEmpty()
  invitedById: number;

  @IsString()
  @IsNotEmpty()
  invitedByName: string;
}
