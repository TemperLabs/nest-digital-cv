import { Args, Field, ID, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { CvService } from './cv.service';

@ObjectType()
export class ProfessionalLink {
  @Field(() => ID) id!: string;
  @Field() label!: string;
  @Field() url!: string;
}

@ObjectType()
export class Skill {
  @Field(() => ID) id!: string;
  @Field() name!: string;
}

@ObjectType()
export class Achievement {
  @Field(() => ID) id!: string;
  @Field() description!: string;
}

@ObjectType()
export class Experience {
  @Field(() => ID) id!: string;
  @Field() company!: string;
  @Field() position!: string;
  @Field() period!: string;
  @Field(() => [Achievement]) achievements!: Achievement[];
}

@ObjectType()
export class Project {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field({ nullable: true }) description!: string | null;
  @Field() url!: string;
}

@ObjectType()
export class Profile {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() name!: string;
  @Field() description!: string;
  @Field(() => [ProfessionalLink]) links!: ProfessionalLink[];
  @Field(() => [Skill]) skills!: Skill[];
  @Field(() => [Experience]) experience!: Experience[];
  @Field(() => [Project]) projects!: Project[];
}

@Resolver(() => Profile)
export class CvResolver {
  constructor(private readonly cv: CvService) {}

  @Query(() => Profile, { nullable: true })
  profile(@Args('slug', { nullable: true, defaultValue: 'demo' }) slug: string): Promise<Profile | null> {
    return this.cv.getProfile(slug);
  }
}
