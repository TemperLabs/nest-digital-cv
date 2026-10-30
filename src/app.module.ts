import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';
import { CvResolver } from './cv.resolver';
import { CvService } from './cv.service';

@Module({
  imports: [GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    graphiql: process.env.NODE_ENV !== 'production',
  })],
  providers: [CvResolver, CvService],
})
export class AppModule {}
