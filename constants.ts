import { TeacherLevel, PositionType, SalaryConfig, StudentGrade } from './types';

// Trial Class Constants
export const BASE_TRIAL_FAIL_RATE = 99; // Registration fee
export const TRIAL_SUCCESS_BONUS = 50; // 25 yuan/hour * 2 hours

// Salary Table based on the provided data
export const SALARY_TABLE: Record<TeacherLevel, Record<PositionType, SalaryConfig>> = {
  [TeacherLevel.ONE]: {
    [PositionType.HIGH_SCHOOL]: { base: 2100, post: 200 },
    [PositionType.PRIMARY_MIDDLE]: { base: 2100, post: 0 },
  },
  [TeacherLevel.TWO]: {
    [PositionType.HIGH_SCHOOL]: { base: 2100, post: 200 },
    [PositionType.PRIMARY_MIDDLE]: { base: 2100, post: 0 },
  },
  [TeacherLevel.THREE]: {
    [PositionType.HIGH_SCHOOL]: { base: 2100, post: 500 },
    [PositionType.PRIMARY_MIDDLE]: { base: 2100, post: 200 },
  },
  [TeacherLevel.FOUR]: {
    [PositionType.HIGH_SCHOOL]: { base: 2100, post: 700 },
    [PositionType.PRIMARY_MIDDLE]: { base: 2100, post: 400 },
  },
  [TeacherLevel.FIVE]: {
    [PositionType.HIGH_SCHOOL]: { base: 2100, post: 900 },
    [PositionType.PRIMARY_MIDDLE]: { base: 2100, post: 700 },
  },
  [TeacherLevel.SIX]: {
    [PositionType.HIGH_SCHOOL]: { base: 2100, post: 1200 },
    [PositionType.PRIMARY_MIDDLE]: { base: 2100, post: 900 },
  },
  [TeacherLevel.SEVEN]: {
    [PositionType.HIGH_SCHOOL]: { base: 2100, post: 1500 },
    [PositionType.PRIMARY_MIDDLE]: { base: 2100, post: 1200 },
  },
  [TeacherLevel.EIGHT]: {
    [PositionType.HIGH_SCHOOL]: { base: 2100, post: 1900 },
    [PositionType.PRIMARY_MIDDLE]: { base: 2100, post: 1500 },
  },
};

// Personal Class Rates Matrix
// Maps Level -> Student Grade -> Rate
export const PERSONAL_CLASS_RATES: Record<TeacherLevel, Record<StudentGrade, number>> = {
  [TeacherLevel.ONE]: {
    [StudentGrade.GRADE_1_2]: 90,
    [StudentGrade.GRADE_3_4]: 100,
    [StudentGrade.GRADE_5_6]: 110,
    [StudentGrade.MIDDLE_1]: 120,
    [StudentGrade.MIDDLE_2]: 130,
    [StudentGrade.MIDDLE_3]: 140,
    [StudentGrade.HIGH_1]: 150,
    [StudentGrade.HIGH_2]: 160,
    [StudentGrade.HIGH_3]: 170,
  },
  [TeacherLevel.TWO]: {
    [StudentGrade.GRADE_1_2]: 100,
    [StudentGrade.GRADE_3_4]: 110,
    [StudentGrade.GRADE_5_6]: 120,
    [StudentGrade.MIDDLE_1]: 130,
    [StudentGrade.MIDDLE_2]: 140,
    [StudentGrade.MIDDLE_3]: 150,
    [StudentGrade.HIGH_1]: 160,
    [StudentGrade.HIGH_2]: 170,
    [StudentGrade.HIGH_3]: 180,
  },
  [TeacherLevel.THREE]: {
    [StudentGrade.GRADE_1_2]: 110,
    [StudentGrade.GRADE_3_4]: 120,
    [StudentGrade.GRADE_5_6]: 130,
    [StudentGrade.MIDDLE_1]: 140,
    [StudentGrade.MIDDLE_2]: 150,
    [StudentGrade.MIDDLE_3]: 160,
    [StudentGrade.HIGH_1]: 170,
    [StudentGrade.HIGH_2]: 180,
    [StudentGrade.HIGH_3]: 190,
  },
  [TeacherLevel.FOUR]: {
    [StudentGrade.GRADE_1_2]: 120,
    [StudentGrade.GRADE_3_4]: 130,
    [StudentGrade.GRADE_5_6]: 140,
    [StudentGrade.MIDDLE_1]: 150,
    [StudentGrade.MIDDLE_2]: 160,
    [StudentGrade.MIDDLE_3]: 170,
    [StudentGrade.HIGH_1]: 180,
    [StudentGrade.HIGH_2]: 190,
    [StudentGrade.HIGH_3]: 200,
  },
  [TeacherLevel.FIVE]: {
    [StudentGrade.GRADE_1_2]: 130,
    [StudentGrade.GRADE_3_4]: 140,
    [StudentGrade.GRADE_5_6]: 150,
    [StudentGrade.MIDDLE_1]: 160,
    [StudentGrade.MIDDLE_2]: 170,
    [StudentGrade.MIDDLE_3]: 180,
    [StudentGrade.HIGH_1]: 190,
    [StudentGrade.HIGH_2]: 200,
    [StudentGrade.HIGH_3]: 210,
  },
  // Levels 6, 7, 8 have the same rates as Level 5 in the provided image
  [TeacherLevel.SIX]: {
    [StudentGrade.GRADE_1_2]: 130,
    [StudentGrade.GRADE_3_4]: 140,
    [StudentGrade.GRADE_5_6]: 150,
    [StudentGrade.MIDDLE_1]: 160,
    [StudentGrade.MIDDLE_2]: 170,
    [StudentGrade.MIDDLE_3]: 180,
    [StudentGrade.HIGH_1]: 190,
    [StudentGrade.HIGH_2]: 200,
    [StudentGrade.HIGH_3]: 210,
  },
  [TeacherLevel.SEVEN]: {
    [StudentGrade.GRADE_1_2]: 130,
    [StudentGrade.GRADE_3_4]: 140,
    [StudentGrade.GRADE_5_6]: 150,
    [StudentGrade.MIDDLE_1]: 160,
    [StudentGrade.MIDDLE_2]: 170,
    [StudentGrade.MIDDLE_3]: 180,
    [StudentGrade.HIGH_1]: 190,
    [StudentGrade.HIGH_2]: 200,
    [StudentGrade.HIGH_3]: 210,
  },
  [TeacherLevel.EIGHT]: {
    [StudentGrade.GRADE_1_2]: 130,
    [StudentGrade.GRADE_3_4]: 140,
    [StudentGrade.GRADE_5_6]: 150,
    [StudentGrade.MIDDLE_1]: 160,
    [StudentGrade.MIDDLE_2]: 170,
    [StudentGrade.MIDDLE_3]: 180,
    [StudentGrade.HIGH_1]: 190,
    [StudentGrade.HIGH_2]: 200,
    [StudentGrade.HIGH_3]: 210,
  },
};