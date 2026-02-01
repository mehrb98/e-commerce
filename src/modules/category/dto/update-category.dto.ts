import { PartialType } from "@nestjs/swagger";
import { CategoryDTO } from "./category.dto";

export class UpdateCategoryDTO 
    extends PartialType(CategoryDTO) {}