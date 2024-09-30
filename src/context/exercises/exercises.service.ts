import { Inject, Injectable } from "@nestjs/common";

import { CreateExerciseDto } from "@/src/context/exercises/dto/create-exercise.dto";
import { UpdateExerciseDto } from "@/src/context/exercises/dto/update-exercise.dto";
import { EXERCISE_REPOSITORY } from "@/src/context/exercises/repositories/exercise.repository";

@Injectable()
export class ExercisesService {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exerciseRepository: any,
  ) {}
  async create(createExcerciseDto: CreateExerciseDto) {
    return await this.exerciseRepository.createExercise(createExcerciseDto);
  }

  async getExercises(
    page: number,
    limit: number,
    name?: string,
    type?: string,
    mode?: string,
  ) {
    const offset = (page - 1) * limit;
    const filters: any = {};

    if (name) {
      filters.name = { $regex: name, $options: "i" };
    }

    if (type) {
      filters.type = type;
    }

    if (mode) {
      filters.mode = mode;
    }

    const [data, total] = await Promise.all([
      this.exerciseRepository.getExercises(offset, limit, filters),
      this.exerciseRepository.countExercises(filters),
    ]);

    return {
      success: true,
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    try {
      const exercise = await this.exerciseRepository.findOne(id);
      if (exercise) {
        return {
          success: true,
          data: exercise,
        };
      } else {
        throw "Exercise not found";
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Exercise cannot be found: ${error.message}`,
      };
    }
  }

  async update(id: string, updateExcerciseDto: UpdateExerciseDto) {
    try {
      const exercise = await this.exerciseRepository.update(
        id,
        updateExcerciseDto,
      );
      if (exercise) {
        return {
          success: true,
          data: exercise,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Exercise cannot be updated: ${error.message}`,
      };
    }
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const wasRemoved = await this.exerciseRepository.remove(id);

      if (wasRemoved) {
        return {
          success: true,
          message: "Exerscise removed successfully",
        };
      } else {
        throw new Error("Exercise not found");
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Error when trying to delete exercise: ${error.message}`,
      };
    }
  }
}
