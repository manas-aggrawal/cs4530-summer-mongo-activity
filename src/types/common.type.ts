import { PopulateOptions } from "mongoose";

export interface PopulateArgs extends SelectArgs {
  populate: PopulateOptions[];
}

export interface SelectArgs {
  select: string;
}
