import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { ActiveUser } from 'iam/decorators/active-user.decorator';
import { ActiveUserData } from 'iam/interfaces/active-user-data.interface';
import { Roles } from 'iam/authorization/decorators/roles.decorators';
import { Role } from 'users/enums/role.enum';
import { FrameworkContributorPolicy } from 'iam/authentication/policies/framework-contributor.policy';
import { Policies } from 'iam/authentication/decorators/policies.decorator';
// import { Permissions } from 'iam/authorization/decorators/permissions.decorator';
// import { Permission } from 'iam/authorization/permission.type';

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  // @Permissions(Permission.CreateCoffee)
  // @Roles(Role.Admin)
  @Policies(new FrameworkContributorPolicy())
  @Post()
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.create(createCoffeeDto);
  }

  @Get()
  findAll(@ActiveUser() user: ActiveUserData) {
    console.log(user);
    return this.coffeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coffeesService.findOne(+id);
  }

  @Roles(Role.Admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeesService.update(+id, updateCoffeeDto);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coffeesService.remove(+id);
  }
}
