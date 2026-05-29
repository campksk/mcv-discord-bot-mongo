import z from 'zod'

export const getCoursesResponseSchema = z.object({
  status: z.number(),
  data: z.array(
    z.object({
      cv_cid: z.string().transform((val) => parseInt(val)),
      course_no: z.string(),
      title: z.string(),
      year: z.string().transform((val) => parseInt(val)),
      semester: z.string().transform((val) => parseInt(val)),
      thumb_location: z.string(),
      default_material_thumb: z.string(),
      org_id: z.string(),
      school_id: z.string(),
      dept_id: z.string(),
      nid: z.string(),
      course_type: z.string(),
      course: z.object({
        course_no: z.string(),
        year: z.string(),
        semester: z.string(),
        section: z.string(),
        role: z.string(),
        cv_cid: z.string(),
      }),
    })
  ),
})

export type ParsedGetCoursesResponse = z.output<typeof getCoursesResponseSchema>
