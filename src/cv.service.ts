import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class CvService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(slug: string) {
    return this.prisma.profile.findUnique({ where: { slug } });
  }

  getLinks(profileId: string) {
    return this.prisma.professionalLink.findMany({ where: { profileId }, orderBy: { label: 'asc' } });
  }

  getSkills(profileId: string) {
    return this.prisma.skill.findMany({ where: { profileId }, orderBy: { name: 'asc' } });
  }

  getExperience(profileId: string, withAchievements: boolean) {
    return this.prisma.experience.findMany({
      where: { profileId },
      orderBy: { period: 'desc' },
      include: { achievements: withAchievements },
    });
  }

  getProjects(profileId: string) {
    return this.prisma.project.findMany({ where: { profileId }, orderBy: { name: 'asc' } });
  }
}
