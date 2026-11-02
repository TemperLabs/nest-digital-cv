import { Args, Field, ID, Info, ObjectType, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo, SelectionSetNode } from 'graphql';
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
  @Field(() => String, { nullable: true }) description!: string | null;
  @Field() url!: string;
}

@ObjectType()
export class Profile {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() name!: string;
  @Field() description!: string;
  @Field(() => [ProfessionalLink]) links?: ProfessionalLink[];
  @Field(() => [Skill]) skills?: Skill[];
  @Field(() => [Experience]) experience?: Experience[];
  @Field(() => [Project]) projects?: Project[];
}

@Resolver(() => Profile)
export class CvResolver {
  constructor(private readonly cv: CvService) {}

  @Query(() => Profile, { nullable: true })
  profile(@Args('slug', { nullable: true, defaultValue: 'demo' }) slug: string): Promise<Profile | null> {
    return this.cv.getProfile(slug);
  }

  @ResolveField(() => [ProfessionalLink])
  links(@Parent() profile: Profile): Promise<ProfessionalLink[]> {
    return this.cv.getLinks(profile.id);
  }

  @ResolveField(() => [Skill])
  skills(@Parent() profile: Profile): Promise<Skill[]> {
    return this.cv.getSkills(profile.id);
  }

  @ResolveField(() => [Experience])
  experience(@Parent() profile: Profile, @Info() info: GraphQLResolveInfo): Promise<Experience[]> {
    return this.cv.getExperience(profile.id, hasSelectedField(info, 'achievements')) as Promise<Experience[]>;
  }

  @ResolveField(() => [Project])
  projects(@Parent() profile: Profile): Promise<Project[]> {
    return this.cv.getProjects(profile.id);
  }
}

function hasSelectedField(info: GraphQLResolveInfo, name: string): boolean {
  const seen = new Set<string>();
  const inspect = (set: SelectionSetNode | undefined): boolean => {
    if (!set) return false;
    for (const selection of set.selections) {
      if (selection.kind === 'Field' && selection.name.value === name) return true;
      if (selection.kind === 'InlineFragment' && inspect(selection.selectionSet)) return true;
      if (selection.kind === 'FragmentSpread') {
        const fragmentName = selection.name.value;
        if (!seen.has(fragmentName)) {
          seen.add(fragmentName);
          if (inspect(info.fragments[fragmentName]?.selectionSet)) return true;
        }
      }
    }
    return false;
  };
  return info.fieldNodes.some(node => inspect(node.selectionSet));
}
