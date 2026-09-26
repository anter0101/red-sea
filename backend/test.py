import os
import sys
from textwrap import dedent

def generate_module(name: str, output_dir="output"):
    name = name.lower()
    class_name = name.capitalize()
    dto_name = f"{class_name}DTO"
    create_dto = f"Create{class_name}DTO"
    update_dto = f"Update{class_name}DTO"
    service_name = f"{class_name}Service"
    controller_name = f"{class_name}Controller"
    module_name = f"{class_name}Module"
    mapper_func = f"map{class_name}To{class_name}DtoSelective"

    module_dir = os.path.join(output_dir, name)
    dtos_dir = os.path.join(module_dir, "dtos")
    os.makedirs(dtos_dir, exist_ok=True)

    # 1️⃣ Entity
    entity = dedent(f"""
    import {{ Entity, Column, ManyToOne }} from 'typeorm';
    import {{ BaseEntity }} from 'src/core/utils/base.entity';

    @Entity('{name}')
    export class {class_name} extends BaseEntity {{
     
    }}
    """).strip()

    # 2️⃣ DTO
    dto = dedent(f"""
    import {{ BaseDTO }} from 'src/core/utils/base.dto';

    export class {dto_name} extends BaseDTO {{
     
    }}
    """).strip()

    create_dto_code = dedent(f"""
    import {{ ApiProperty, OmitType }} from '@nestjs/swagger';
    import {{ {dto_name} }} from './{name}.dto';

    export class {create_dto} extends OmitType({dto_name}, [
     
    ] as const) {{
      
    }}
    """).strip()

    update_dto_code = dedent(f"""
    import {{ PartialType }} from '@nestjs/swagger';
    import {{ {dto_name} }} from './{name}.dto';

    export class {update_dto} extends PartialType({dto_name}) {{}}
    """).strip()

    # 3️⃣ Mapper
    mapper = dedent(f"""
    import {{ {class_name} }} from './{name}.entity';
    import {{ {dto_name} }} from './dtos/{name}.dto';
    import {{ BaseDTO }} from 'src/core/utils/base.dto';
    import {{ {update_dto} }} from './dtos/update-{name}.dto';

    const allowed{class_name}DtoKeys: ReadonlyArray<keyof {dto_name} | keyof BaseDTO> = [
    
    ];

    export function {mapper_func}(
      entity: {class_name},
      keys?: (keyof {dto_name} | keyof BaseDTO)[]
    ): {update_dto};
    export function {mapper_func}(
      entities: {class_name}[],
      keys?: (keyof {dto_name} | keyof BaseDTO)[]
    ): {update_dto}[];
    export function {mapper_func}(
      input: {class_name} | {class_name}[],
      keys?: (keyof {dto_name} | keyof BaseDTO)[]
    ): {update_dto} | {update_dto}[] {{
      const mapSingle = (entity: {class_name}): {update_dto} => {{
        const resultDto: {update_dto} = {{}};
        const keysToMap = (keys || allowed{class_name}DtoKeys).filter((key) =>
          (allowed{class_name}DtoKeys as Array<keyof {dto_name} | keyof BaseDTO>).includes(key)
        );

        keysToMap.forEach((key) => {{
          if (key in entity && entity[key as keyof {class_name}] !== undefined) {{
            (resultDto as any)[key] = entity[key as keyof {class_name}];
          }}
        }});
        return resultDto;
      }};

      return Array.isArray(input) ? input.map(mapSingle) : mapSingle(input);
    }}
    """).strip()

    # 4️⃣ Controller
    controller = dedent(f"""
    import {{
      Controller,
      Logger,
      UseGuards,
      Post,
      Put,
      Delete,
      Body,
      Param,
      NotFoundException,
      BadRequestException,
    }} from '@nestjs/common';
    import {{
      ApiBearerAuth,
      ApiOperation,
      ApiResponse,
      ApiTags,
    }} from '@nestjs/swagger';
    import {{ AuthGuard, Roles, RolesGuard, AuthUser }} from 'src/core/security';
    import {{ {dto_name} }} from './dtos/{name}.dto';
    import {{ UserRole }} from 'src/core/enums/user-role';
    import {{ {update_dto} }} from './dtos/update-{name}.dto';
    import {{ {create_dto} }} from './dtos/create-{name}.dto';
    import {{ {service_name} }} from './{name}.service';

    @Controller('api/{name}s')
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiTags('{name}s-module')
    export class {controller_name} {{
      logger = new Logger('{class_name}sController');

      constructor(private readonly {name}Service: {service_name}) {{}}

      @Post('/')
      @Roles(UserRole.ADMIN)
      @ApiOperation({{ summary: 'Create a new {name}' }})
      @ApiResponse({{ status: 201, description: 'Record created', type: {dto_name} }})
      async create(@Body() dto: {create_dto}, @AuthUser() user: any): Promise<{dto_name}> {{
        const existing = await this.{name}Service.findByFields({{ where: {{ url: dto.url }} }});
        if (existing) throw new BadRequestException(`{class_name} with URL ${{dto.url}} already exists`);
        return this.{name}Service.save(dto, user?.email);
      }}

      @Put('/:id')
      @Roles(UserRole.ADMIN)
      @ApiOperation({{ summary: 'Update existing {name}' }})
      @ApiResponse({{ status: 200, description: 'Record updated', type: {dto_name} }})
      async update(@Param('id') id: number, @Body() dto: {update_dto}, @AuthUser() user: any): Promise<{update_dto}> {{
        const existing = await this.{name}Service.findById(id);
        if (!existing) throw new NotFoundException(`{class_name} with id ${{id}} not found`);
        dto.id = id;
        return this.{name}Service.update(dto, user?.email);
      }}

      @Delete('/:id')
      @Roles(UserRole.ADMIN)
      @ApiOperation({{ summary: 'Delete {name}' }})
      async delete(@Param('id') id: number): Promise<void> {{
        const existing = await this.{name}Service.findById(id);
        if (!existing) throw new NotFoundException(`{class_name} with id ${{id}} not found`);
        await this.{name}Service.delete(id);
      }}
    }}
    """).strip()

    # 5️⃣ Service
    service = dedent(f"""
    import {{ Injectable }} from '@nestjs/common';
    import {{ InjectRepository }} from '@nestjs/typeorm';
    import {{ Repository }} from 'typeorm';
    import {{ {class_name} }} from './{name}.entity';

    @Injectable()
    export class {service_name} {{
      constructor(@InjectRepository({class_name}) private repo: Repository<{class_name}>) {{}}

      findByFields(options: any) {{
        return this.repo.findOne(options);
      }}

      findById(id: number) {{
        return this.repo.findOne({{ where: {{ id }} }});
      }}

      async save(data: any, userEmail: string) {{
        return this.repo.save(data);
      }}

      async update(data: any, userEmail: string) {{
        return this.repo.save(data);
      }}

      async delete(id: number) {{
        await this.repo.delete(id);
      }}
    }}
    """).strip()

    # 6️⃣ Module
    module = dedent(f"""
    import {{ Module }} from '@nestjs/common';
    import {{ TypeOrmModule }} from '@nestjs/typeorm';
    import {{ {controller_name} }} from './{name}.controller';
    import {{ {service_name} }} from './{name}.service';
    import {{ {class_name} }} from './{name}.entity';
    import {{ UserModule }} from '../user/user.module';

    @Module({{
      imports: [TypeOrmModule.forFeature([{class_name}]), UserModule],
      controllers: [{controller_name}],
      providers: [{service_name}],
    }})
    export class {module_name} {{}}
    """).strip()

    # Write all files
    files = {
        f"{module_dir}/{name}.entity.ts": entity,
        f"{module_dir}/{name}.controller.ts": controller,
        f"{module_dir}/{name}.service.ts": service,
        f"{module_dir}/{name}.mapper.ts": mapper,
        f"{module_dir}/{name}.module.ts": module,
        f"{dtos_dir}/{name}.dto.ts": dto,
        f"{dtos_dir}/create-{name}.dto.ts": create_dto_code,
        f"{dtos_dir}/update-{name}.dto.ts": update_dto_code,
    }

    for path, content in files.items():
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)

    print(f"✅ Generated NestJS module '{name}' at: {module_dir}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python nestjs_module_generator.py <module_name>")
        sys.exit(1)
    generate_module(sys.argv[1])
