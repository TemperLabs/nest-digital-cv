import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Profile } from './cv.resolver';

@Injectable()
export class CvService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(slug: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({
      where: { slug },
      include: {
        links: { orderBy: { label: 'asc' } },
        skills: { orderBy: { name: 'asc' } },
        experience: {
          orderBy: { period: 'desc' },
          include: { achievements: true },
        },
        projects: { orderBy: { name: 'asc' } },
      },
    });
  }
}
