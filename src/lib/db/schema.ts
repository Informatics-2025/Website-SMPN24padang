import { users } from './schema/index';
export * from './schema/index';
import {
    pgTable,
    text,
    timestamp,
    varchar,
    integer,
    serial,
    uniqueIndex,
    decimal,
    index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const news = pgTable('news', {
    id: varchar('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    date: text('date').notNull(),
    imageUrl: text('imageUrl'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const comments = pgTable('comments', {
    id: serial('id').primaryKey(),
    content: text('content').notNull(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // Nullable for anonymous
    authorName: text('author_name'), // Required if userId is null
    contentType: text('content_type').notNull(),
    contentId: text('content_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    contentIndex: index('content_idx').on(table.contentType, table.contentId),
}));

export const likes = pgTable('likes', {
    id: serial('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // Nullable for anonymous
    anonymousId: text('anonymous_id'), // For tracking anonymous users
    contentType: text('content_type').notNull(),
    contentId: text('content_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    contentIndex: index('like_content_idx').on(table.contentType, table.contentId),
}));

// RELATIONS

export const usersRelations = relations(users, ({ many }) => ({
	comments: many(comments),
    likes: many(likes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
	user: one(users, {
		fields: [comments.userId],
		references: [users.id],
	}),
}));

export const likesRelations = relations(likes, ({ one }) => ({
	user: one(users, {
		fields: [likes.userId],
		references: [users.id],
	}),
}));


// `curriculums` should map to the SQL table named `curriculums`.
export const curriculums = pgTable('curriculums', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    pdfUrl: text('pdf_url').notNull(),
    category: text('category').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const kelas = pgTable(
    'kelas',
    {
        id: serial('id').primaryKey(),
        tingkat: integer('tingkat').notNull(),
        huruf: varchar('huruf', { length: 1 }).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull(),
    },
    (table) => {
        return {
            unq: uniqueIndex('unique_kelas').on(table.tingkat, table.huruf),
        };
    },
);

export const jenisSampah = pgTable('jenis_sampah', {
    id: serial('id').primaryKey(),
    namaSampah: varchar('nama_sampah', { length: 255 }).notNull(),
    hargaPerKg: decimal('harga_per_kg', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sampahKelas = pgTable('sampah_kelas', {
    id: serial('id').primaryKey(),
    kelasId: integer('kelas_id')
        .notNull()
        .references(() => kelas.id, { onDelete: 'cascade' }),
    jenisSampahId: integer('jenis_sampah_id')
        .notNull()
        .references(() => jenisSampah.id, { onDelete: 'cascade' }),
    jumlahKg: decimal('jumlah_kg', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const guruSispendik = pgTable('guru_sispendik', {
    id: serial('id').primaryKey(),
    namaGuru: varchar('nama_guru', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


export const setoranGuru = pgTable('setoran_guru', {
    id: serial('id').primaryKey(),
    guruId: integer('guru_id')
        .notNull()
        .references(() => guruSispendik.id, { onDelete: 'cascade' }),
    jenisSampahId: integer('jenis_sampah_id')
        .notNull()
        .references(() => jenisSampah.id, { onDelete: 'cascade' }),
    jumlahKg: decimal('jumlah_kg', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const wasteNews = pgTable('waste_news', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    previewUrl: text('preview_url').notNull(),
    googleDriveUrl: text('google_drive_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const wasteDocumentation = pgTable('waste_documentation', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    imageUrl: text('image_url'),
    youtubeUrl: text('youtube_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const wasteVideos = pgTable('waste_videos', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    youtubeUrl: text('youtube_url').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});