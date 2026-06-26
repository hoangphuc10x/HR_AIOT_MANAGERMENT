import { ApiProperty } from '@nestjs/swagger';

export class UserPermissionInfoDto {
  @ApiProperty({ description: 'User ID' })
  id: number; // Include user ID for uniqueness

  @ApiProperty({ description: 'Full name of the user' })
  name: string;

  @ApiProperty({ description: 'Email of the user' })
  email: string;

  @ApiProperty({ description: 'The number of permissions the user has' })
  permissionCount: number;

  @ApiProperty({ description: 'List of permission IDs the user has' })
  permissions?: number[]; // Optional: Include permission IDs
}
