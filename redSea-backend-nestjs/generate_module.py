import os
import sys

# ───────────────────────────────
# 🧠 Helper: PascalCase conversion
# ───────────────────────────────
def to_pascal_case(s):
    return ''.join(word.capitalize() for word in s.split('-'))

# ───────────────────────────────
# 🚀 Main Generator
# ───────────────────────────────
def generate_module(module_path):
    # Determine module name and target directory
    module_path = os.path.abspath(module_path)
    module_name = os.path.basename(module_path)
    pascal_name = to_pascal_case(module_name)

    base_dir = module_path
    dtos_dir = os.path.join(base_dir, "dtos")

    os.makedirs(dtos_dir, exist_ok=True)

    # ─────────────── File Templates ───────────────
    files = {
        f"{base_dir}/{module_name}.controller.ts": f"""import {{ Controller }} from '@nestjs/common';

@Controller('{module_name}')
export class {pascal_name}Controller {{}}""",

        f"{base_dir}/{module_name}.service.ts": f"""import {{ Injectable }} from '@nestjs/common';

@Injectable()
export class {pascal_name}Service {{}}""",

        f"{base_dir}/{module_name}.module.ts": f"""import {{ Module }} from '@nestjs/common';
import {{ {pascal_name}Controller }} from './{module_name}.controller';
import {{ {pascal_name}Service }} from './{module_name}.service';

@Module({{
  controllers: [{pascal_name}Controller],
  providers: [{pascal_name}Service],
}})
export class {pascal_name}Module {{}}""",

        f"{base_dir}/{module_name}.entity.ts": f"""import {{ Entity, PrimaryGeneratedColumn, Column }} from 'typeorm';

@Entity('{module_name}')
export class {pascal_name} {{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}}""",

        f"{base_dir}/{module_name}.mapper.ts": f"""export class {pascal_name}Mapper {{}}"""
    }

    # ─────────────── DTO Templates ───────────────
    dtos = {
        f"{dtos_dir}/{module_name}.dto.ts": f"""export class {pascal_name}Dto {{}}""",

        f"{dtos_dir}/create-{module_name}.dto.ts": f"""export class Create{pascal_name}Dto {{}}""",

        f"{dtos_dir}/update-{module_name}.dto.ts": f"""export class Update{pascal_name}Dto {{}}""",

        f"{dtos_dir}/query-{module_name}.dto.ts": f"""export class Query{pascal_name}Dto {{}}"""
    }

    # ─────────────── Write Files ───────────────
    all_files = {**files, **dtos}
    for filepath, content in all_files.items():
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

    print(f"✅ Module '{module_name}' generated successfully at:\n   {base_dir}")

# ───────────────────────────────
# 🏁 Entry Point
# ───────────────────────────────
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ Please provide a module name or path.\n"
              "   Example:\n"
              "     python3 generate_module.py water-resource\n"
              "     python3 generate_module.py src/modules/water-resource")
        sys.exit(1)

    module_path = sys.argv[1]
    generate_module(module_path)
