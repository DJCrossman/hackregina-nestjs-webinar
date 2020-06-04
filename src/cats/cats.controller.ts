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