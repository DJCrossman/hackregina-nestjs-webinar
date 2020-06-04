# Building progressive Node.js apps with NestJS - Webinar

## First Steps

* Install [Node.js](https://nodejs.org/) (>= 10.13.0)
* Install the Nest CLI
  ```bash
  $ npm i -g @nestjs/cli
  ```
* Create new project
  ```bash
  $ nest new cat-api
  ```
* Open up the folder using [Visual Studio Code CLI](https://code.visualstudio.com/docs/editor/command-line)
  ```bash
  $ code cat-api
  ```
* View the system and project versions
  ```bash
  $ nest info
  ```
* Run `npm start` and point your browser to `http://localhost:3000`, and then terminate the process.
* Explore and explain the initial project generated code
* Run `npm run start:dev` to launch and watch the project

## Controllers, Modules, Providers

* Update the `app.controller` to handle a `GET /ping` that returns `pong - req.headers[user-agent]`
    ```ts
    import { Controller, Get, Headers } from '@nestjs/common';
    import { AppService } from './app.service';

    @Controller()
    export class AppController {
      constructor(private readonly appService: AppService) {}

      @Get()
      getHello(): string {
        return this.appService.getHello();
      }

      @Get('ping')
      ping(@Headers('user-agent') userAgent: string): string {
        return `pong - ${userAgent}`;
      }
    }
    ```
* Create a new `CatsModule` module, `CatController` controller and `Cat` interface with the cli
  ```bash
  $ nest g module cats

  $ nest g controller cats

  $ nest g interface cats/cat
  ```
* Update the `cats.interface.ts` to include `id`, `name`, `color`, and `created`
  ```ts
  export interface Cat {
    id: number
    name: string
    color?: string
    created: Date
  }
  ```
* Update the `cats.controller.ts` to include a `create` and `findAll` method
  ```ts
  import { Controller, Post, Get, Body } from '@nestjs/common';
  import { Cat } from './cat.interface';

  @Controller('cats')
  export class CatsController {

    private readonly cats: Cat[] = [];

    @Post()
    async create(@Body() cat: Cat): Promise<Cat> {
      this.cats.push(cat);
      return cat
    }

    @Get()
    async findAll(): Promise<Cat[]> {
      return this.cats;
    }

  }
  ```
* Using Postman, trigger the `findAll` method, then the `create` and then the `findAll` again
* Create a new `CatsService` service with the cli
  ```bash
  $ nest g service cats
  ```
* Update the `cats.service.ts` to include a `create` and `findAll` method
  ```ts
  import { Injectable } from '@nestjs/common';
  import { Cat } from './cat.interface';

  @Injectable()
  export class CatsService {
    private readonly cats: Cat[] = [];

    create(cat: Cat): Cat {
      this.cats.push(cat);
      return cat
    }

    findAll(): Cat[] {
      return this.cats;
    }
  }
  ```
* Update the `cats.controller.ts` to inject `CatsService`
  ```ts
  import { Controller, Post, Get, Body } from '@nestjs/common';
  import { Cat } from './cat.interface';
  import { CatsService } from './cats.service';

  @Controller('cats')
  export class CatsController {

    constructor(private catsService: CatsService) {}

    @Post()
    async create(@Body() cat: Cat): Promise<Cat> {
      return this.catsService.create(cat);
    }

    @Get()
    async findAll(): Promise<Cat[]> {
      return this.catsService.findAll();
    }

  }
  ```
* View the `cats.modules.ts` to see that provider is included

## Database

* Explain the concept of an ORM/ODM and talk about TypeORM
* Install require dependencies for your database
  ```bash
  npm install --save @nestjs/typeorm@7.0.0 typeorm pg
  ```
* Once the installation process is complete, we can import the `TypeOrmModule` into the root `AppModule`
  ```ts
  import { Module } from '@nestjs/common';
  import { TypeOrmModule } from '@nestjs/typeorm'
  import { AppController } from './app.controller';
  import { AppService } from './app.service';
  import { CatsModule } from './cats/cats.module';

  @Module({
    imports: [
      CatsModule,
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'root',
        password: 'root',
        database: 'cats',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    ],
    controllers: [AppController],
    providers: [AppService],
  })
  export class AppModule {}
  ```
* TypeORM supports the repository design pattern
* Create a `CatEntity` using the cli
  ```bash
  $ nest g class cats/cat.entity --no-spec
  ```
* Update the `cat.entity.ts` to include `id`, `name`, `color`, and `created`
  ```ts
  import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

  @Entity()
  export class CatEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column({ nullable: true })
    color?: string

    @Column({ type: 'timestamp', update: false, default: () => 'now()' })
    created: Date
  }
  ```
* Update the `cat.module.ts` to define which repositories are registered in the current scope
  ```ts
  import { Module } from '@nestjs/common';
  import { CatsController } from './cats.controller';
  import { CatsService } from './cats.service';
  import { CatEntity } from './cat.entity';
  import { TypeOrmModule } from '@nestjs/typeorm';

  @Module({
    imports: [TypeOrmModule.forFeature([CatEntity])],
    controllers: [CatsController],
    providers: [CatsService]
  })
  export class CatsModule {}
  ```
* Update the `cat.service.ts` to inject the repository for `CatEntity`
  ```ts
  import { Injectable } from '@nestjs/common';
  import { Cat } from './cat.interface';
  import { CatEntity } from './cat.entity';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';

  @Injectable()
  export class CatsService {
    constructor(
      @InjectRepository(CatEntity)
      private repository: Repository<CatEntity>,
    ) {}
    private readonly cats: Cat[] = [];

    async create(cat: Cat): Promise<Cat> {
      return this.repository.save(cat)
    }

    async findAll(): Promise<Cat[]> {
      return this.repository.find()
    }
  }
  ```


## OpenAPI (Swagger)
* Install the required dependencies
  ```bash
  $ npm install --save @nestjs/swagger swagger-ui-express
  ```
* Open the `main.ts` file and initialize Swagger using the `SwaggerModule` class
  ```ts
  import { NestFactory } from '@nestjs/core';
  import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
  import { AppModule } from './app.module';

  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const options = new DocumentBuilder()
      .setTitle('Cats example')
      .setDescription('The cats API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);
    await app.listen(3000);
  }
  bootstrap();
  ```
* Add `ApiTags` decorator to the `CatsController` and `ApiOperation` to it's methods
  ```ts
  import { Controller, Post, Get, Body } from '@nestjs/common';
  import { Cat } from './cat.interface';
  import { CatsService } from './cats.service';
  import { ApiTags, ApiOperation } from '@nestjs/swagger';

  @ApiTags('Cats')
  @Controller('cats')
  export class CatsController {

    constructor(private catsService: CatsService) {}

    @Post()
    @ApiOperation({ summary: `Create a new cat` })
    async create(@Body() cat: Cat): Promise<Cat> {
      return this.catsService.create(cat);
    }

    @Get()
    @ApiOperation({ summary: `Find all the cats` })
    async findAll(): Promise<Cat[]> {
      return this.catsService.findAll();
    }

  }
  ```
