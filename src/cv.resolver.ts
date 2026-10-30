import { Args, Field, ID, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { CvService } from './cv.service';

@ObjectType()
export class Company {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() period!: string;
}

@ObjectType()
export class Project {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() description!: string;
  @Field({ nullable: true }) url!: string | null;
  @Field(() => ID, { nullable: true }) companyId!: string | null;
}

@ObjectType()
export class Skill {
  @Field(() => ID) id!: string;
  @Field() name!: string;
}

@ObjectType()
export class Profile {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() name!: string;
  @Field() about!: string;
  @Field(() => [Company]) companies!: Company[];
  @Field(() => [Project]) projects!: Project[];
  @Field(() => [Skill]) skills!: Skill[];
}

@Resolver(() => Profile)
export class CvResolver {
  constructor(private readonly cv: CvService) {}

  @Query(() => Profile, { nullable: true })
  profile(@Args('slug') slug: string): Promise<Profile | null> {
    return this.cv.getProfile(slug);
  }
}
